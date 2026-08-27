"""
Smart Matching Engine
- Tries to use sentence-transformers (all-MiniLM-L6-v2) if installed.
- Falls back to TF-IDF + cosine similarity (sklearn) if not.
- Final score = weighted combo: semantic 50% + category 25% + distance 15% + time 10%
"""
import math
from typing import List
import re

# Try to load sentence-transformers
USE_ST = False
st_model = None
try:
    from sentence_transformers import SentenceTransformer
    st_model = SentenceTransformer('all-MiniLM-L6-v2')
    USE_ST = True
    print("[matching] Loaded sentence-transformers all-MiniLM-L6-v2")
except Exception as e:
    print(f"[matching] sentence-transformers not available, falling back to TF-IDF: {e}")
    USE_ST = False

# Fallback: sklearn TF-IDF
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

CATEGORY_SYNONYMS = {
    "electronics": ["electronics", "arduino", "microcontroller", "sensor", "board", "kit", "raspberry", "esp32", "uno", "stm32", "nucleo"],
    "textbook": ["textbook", "book", "novel", "notes", "guide", "manual", "edition"],
    "equipment": ["equipment", "lab", "apparatus", "instrument", "gear", "tool", "oscilloscope", "projector"],
    "labkit": ["labkit", "lab kit", "experiment kit", "beaker", "titration"],
    "projectkit": ["project", "kit", "prototype"],
    "sports": ["sports", "ball", "bat", "racket", "gym"],
    "stationery": ["stationery", "pen", "pencil", "calculator", "casio"],
    "furniture": ["chair", "table", "furniture"],
}

# Build reverse map token -> canonical group
TOKEN_TO_CANON = {}
for canon, syns in CATEGORY_SYNONYMS.items():
    for s in syns:
        TOKEN_TO_CANON[s] = canon
        # also handle multi-word handled as separate tokens

def canonicalize_tokens(text: str) -> set:
    tokens = set(clean_text(text).split())
    canon = set()
    for t in tokens:
        canon.add(TOKEN_TO_CANON.get(t, t))
    return canon

def haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def clean_text(s: str) -> str:
    if not s:
        return ""
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def semantic_similarity_fallback(text1: str, text2: str) -> float:
    """TFIDF + Jaccard + Synonym-aware Jaccard"""
    t1 = clean_text(text1)
    t2 = clean_text(text2)
    if not t1 or not t2:
        return 0.0
    scores = []
    if HAS_SKLEARN:
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1,2), stop_words='english')
            tfidf = vectorizer.fit_transform([t1, t2])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            scores.append(float(sim))
        except:
            pass
    # Jaccard raw
    set1 = set(t1.split())
    set2 = set(t2.split())
    if set1 and set2:
        inter = len(set1 & set2)
        union = len(set1 | set2)
        scores.append(inter / union if union else 0.0)
        # Synonym-aware Jaccard
        canon1 = canonicalize_tokens(t1)
        canon2 = canonicalize_tokens(t2)
        inter_c = len(canon1 & canon2)
        union_c = len(canon1 | canon2)
        if union_c:
            scores.append(inter_c / union_c)
    if not scores:
        return 0.0
    # Take max to capture synonym match, but also blend
    # Boost if synonym groups overlap strongly
    return max(scores)

def semantic_score(need_text: str, resource_text: str) -> float:
    if USE_ST and st_model is not None:
        try:
            emb = st_model.encode([need_text, resource_text], convert_to_tensor=False)
            # cosine similarity
            import numpy as np
            a, b = emb[0], emb[1]
            norm_a = np.linalg.norm(a)
            norm_b = np.linalg.norm(b)
            if norm_a == 0 or norm_b == 0:
                return 0.0
            cos = float(np.dot(a, b) / (norm_a * norm_b))
            # normalize from [-1,1] to [0,1]
            return max(0.0, cos)
        except Exception as e:
            print(f"[matching] ST error {e}, fallback")
            return semantic_similarity_fallback(need_text, resource_text)
    else:
        return semantic_similarity_fallback(need_text, resource_text)

def infer_category_from_text(text: str) -> str | None:
    txt = clean_text(text)
    tokens = set(txt.split())
    # check which canonical group appears most
    best = None
    best_count = 0
    for canon, syns in CATEGORY_SYNONYMS.items():
        cnt = len(tokens & set(syns))
        # also check canonical token overlap
        if canon in tokens:
            cnt += 1
        if cnt > best_count:
            best_count = cnt
            best = canon
    if best_count >= 1:
        return best
    return None

def category_score(need_cat: str, res_cat: str, need_text: str = "") -> float:
    # infer if empty
    if not need_cat and need_text:
        inferred = infer_category_from_text(need_text)
        if inferred:
            need_cat = inferred
    if not need_cat or not res_cat:
        return 0.5
    nc = need_cat.lower().strip()
    rc = res_cat.lower().strip()
    if nc == rc:
        return 1.0
    # check synonym overlap
    for base, syns in CATEGORY_SYNONYMS.items():
        if nc in syns and rc in syns:
            return 0.85
        if nc == base and rc in syns:
            return 0.75
        if rc == base and nc in syns:
            return 0.75
        # if both categories are synonyms of same base
        if nc == base and rc == base:
            return 1.0
    # synonym group overlap: if need_text inferred category equals resource category
    if need_text:
        inferred = infer_category_from_text(need_text)
        if inferred and inferred == rc:
            return 0.9
        if inferred and inferred in CATEGORY_SYNONYMS.get(rc, []):
            return 0.8
    # partial string overlap
    if nc in rc or rc in nc:
        return 0.6
    return 0.2

def distance_score(dist_km: float | None) -> float:
    if dist_km is None:
        return 0.85  # unknown => optimistic for campus (assume nearby)
    import math
    return math.exp(-dist_km / 3.0)

def time_score(need_by, res_from, res_until) -> float:
    """If need deadline is within resource availability, score high."""
    try:
        from datetime import date
        if need_by is None:
            return 0.8  # no deadline => fairly available
        if res_from is None and res_until is None:
            return 0.7
        # if need_by <= res_until and need_by >= res_from (if given)
        if res_until and need_by > res_until:
            return 0.2  # resource expires before need
        if res_from and need_by < res_from:
            return 0.3  # resource not yet available
        return 1.0
    except:
        return 0.5

def compute_match(need, resource) -> dict:
    need_text = f"{need.title} {need.description or ''} {need.category or ''}"
    res_text = f"{resource.title} {resource.description or ''} {resource.category or ''}"

    sem = semantic_score(need_text, res_text)
    # Synonym boost: if both texts share canonical electronics tokens, boost semantic
    canon_need = canonicalize_tokens(need_text)
    canon_res = canonicalize_tokens(res_text)
    if len(canon_need & canon_res) >= 1 and sem < 0.6:
        # at least one canonical overlap (e.g., arduino vs microcontroller both map to electronics)
        sem = max(sem, 0.55)
    cat = category_score(need.category, resource.category, need_text)
    dist = haversine_km(need.latitude, need.longitude, resource.latitude, resource.longitude)
    d_score = distance_score(dist)
    t_score = time_score(need.needed_by, resource.available_from, resource.available_until)

    # Weighted final: semantic 45%, category 30%, distance 15%, time 10%  (slightly more weight to category for demo)
    final = 0.45*sem + 0.30*cat + 0.15*d_score + 0.10*t_score
    # boost if category matches strongly and semantic moderate
    if cat >= 0.85 and sem >= 0.3:
        final = min(1.0, final + 0.07)
    if sem > 0.75 and cat > 0.8:
        final = min(1.0, final + 0.05)

    reasons = []
    if sem > 0.7:
        reasons.append(f"High semantic match ({sem*100:.0f}%)")
    elif sem > 0.4:
        reasons.append(f"Moderate semantic similarity ({sem*100:.0f}%)")
    else:
        reasons.append(f"Low semantic overlap ({sem*100:.0f}%)")
    if cat >= 1.0:
        reasons.append("Exact category match")
    elif cat >= 0.75:
        reasons.append("Compatible category")
    elif cat < 0.4:
        reasons.append("Different category")
    if dist is not None:
        reasons.append(f"{dist:.1f} km away")
        if d_score > 0.8:
            reasons.append("Very close proximity")
    else:
        reasons.append("Distance unknown")
    if t_score >= 0.9:
        reasons.append("Available within your timeline")
    elif t_score < 0.4:
        reasons.append("Availability window mismatch")

    return {
        "semantic_score": round(sem, 3),
        "category_score": round(cat, 3),
        "distance_km": round(dist, 2) if dist is not None else None,
        "distance_score": round(d_score, 3),
        "time_score": round(t_score, 3),
        "match_score": round(final*100, 1),
        "reasons": reasons,
        "final": final
    }

def rank_resources_for_need(need, resources: List) -> List[dict]:
    scored = []
    for r in resources:
        # skip non-available? For demo we include available + reserved
        if r.status not in ("available", "reserved"):
            # still include but penalize
            pass
        result = compute_match(need, r)
        scored.append((r, result))
    scored.sort(key=lambda x: x[1]["final"], reverse=True)
    return scored
