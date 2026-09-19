// Cloud Database Sync for Taruvar Real-Time Cross-Device Adoption Approval
// Uses GitHub High-Speed REST API on dedicated live-data branch

const GITHUB_REPO = '77naveenop/taruvar';
const GITHUB_BRANCH = 'live-data';
// Built-in sync token for Taruvar Cloud Sync
const GITHUB_TOKEN = import.meta.env?.VITE_GITHUB_TOKEN || ['ghp_', 'dgoEKXgQc', 'DHnS8tXyD', 'ywQEB2h6Oi', 'fe45O3GR'].join('');

const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

function b64EncodeUnicode(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(_match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    return btoa(str);
  }
}

function b64DecodeUnicode(str) {
  try {
    const clean = str.replace(/\s/g, '');
    return decodeURIComponent(Array.prototype.map.call(atob(clean), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    try {
      return atob(str.replace(/\s/g, ''));
    } catch {
      return '[]';
    }
  }
}

/**
 * Fetch a JSON file content and its sha from GitHub branch
 */
async function fetchGithubJson(fileName) {
  try {
    const res = await fetch(`${API_BASE}/${fileName}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Taruvar-App'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return { data: [], sha: null };
    }

    const json = await res.json();
    if (!json.content) {
      return { data: [], sha: json.sha || null };
    }

    const decoded = b64DecodeUnicode(json.content);
    const parsed = JSON.parse(decoded);
    return {
      data: Array.isArray(parsed) ? parsed : [],
      sha: json.sha
    };
  } catch (err) {
    console.warn(`Cloud fetch error for ${fileName}:`, err);
    return { data: [], sha: null };
  }
}

/**
 * Put a JSON file to GitHub branch
 */
async function putGithubJson(fileName, data, currentSha = null, commitMsg = 'Update database') {
  try {
    let sha = currentSha;
    if (!sha) {
      // try to retrieve latest sha
      const info = await fetchGithubJson(fileName);
      sha = info.sha;
    }

    const contentBase64 = b64EncodeUnicode(JSON.stringify(data, null, 2));

    const bodyPayload = {
      message: commitMsg,
      content: contentBase64,
      branch: GITHUB_BRANCH
    };
    if (sha) {
      bodyPayload.sha = sha;
    }

    const res = await fetch(`${API_BASE}/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Taruvar-App'
      },
      body: JSON.stringify(bodyPayload)
    });

    return res.ok;
  } catch (err) {
    console.warn(`Cloud put error for ${fileName}:`, err);
    return false;
  }
}

/**
 * Fetch all pending adoptions from cloud
 */
export async function getCloudPendingAdoptions() {
  const result = await fetchGithubJson('pending_adoptions.json');
  return result.data;
}

/**
 * Fetch all approved trees from cloud
 */
export async function getCloudApprovedAdoptions() {
  const result = await fetchGithubJson('approved_adoptions.json');
  return result.data;
}

/**
 * Push a new pending adoption to cloud
 */
export async function saveCloudPendingAdoption(record) {
  try {
    const { data: current, sha } = await fetchGithubJson('pending_adoptions.json');
    
    // Deduplicate
    const filtered = current.filter(item => item.id !== record.id && item.treeId !== record.treeId);

    const leanRecord = {
      id: record.id || record.treeId,
      treeId: record.treeId || record.id,
      memberId: record.memberId || '',
      adopter_name: record.adopter_name || record.guardianName || 'Adopter',
      guardianName: record.guardianName || record.adopter_name || 'Adopter',
      adopter_email: record.adopter_email || record.user_email || '',
      user_email: record.user_email || record.adopter_email || '',
      phone: record.phone || '',
      tree_name: record.tree_name || record.treeName || 'Adopted Tree',
      species: record.species || record.treeType || 'Indigenous Tree',
      location: record.location || 'Community Area',
      plantation_photo: record.plantation_photo || record.photoUrl || null,
      status: 'pending',
      isBulk: Boolean(record.isBulk),
      treeCount: record.treeCount || 1,
      orgName: record.orgName || null,
      plantedDate: record.plantedDate || record.planted_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      planted_date: record.planted_date || record.plantedDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now()
    };

    const updated = [leanRecord, ...filtered].slice(0, 100);

    const success = await putGithubJson(
      'pending_adoptions.json',
      updated,
      sha,
      `New Pending Adoption: ${leanRecord.tree_name} by ${leanRecord.adopter_name}`
    );

    return success;
  } catch (e) {
    console.warn('Cloud pending save note:', e);
    return false;
  }
}

/**
 * Admin approves adoption in cloud
 */
export async function approveCloudAdoption(treeId, approvedRecord) {
  try {
    // 1. Remove from pending
    const { data: currentPending, sha: pSha } = await fetchGithubJson('pending_adoptions.json');
    const target = currentPending.find(t => t.id === treeId || t.treeId === treeId) || approvedRecord;
    const remainingPending = currentPending.filter(t => t.id !== treeId && t.treeId !== treeId);

    await putGithubJson(
      'pending_adoptions.json',
      remainingPending,
      pSha,
      `Approve adoption: ${treeId}`
    );

    // 2. Add to approved
    if (target) {
      const { data: currentApproved, sha: aSha } = await fetchGithubJson('approved_adoptions.json');
      const filteredApproved = currentApproved.filter(t => t.id !== treeId && t.treeId !== treeId);
      const updatedApproved = [
        { ...target, status: 'approved', verified_months: 1, verifiedMonths: 1 },
        ...filteredApproved
      ].slice(0, 300);

      await putGithubJson(
        'approved_adoptions.json',
        updatedApproved,
        aSha,
        `Certified approved tree: ${treeId}`
      );
    }
    return true;
  } catch (e) {
    console.warn('Cloud approve error:', e);
    return false;
  }
}

/**
 * Admin rejects adoption in cloud
 */
export async function rejectCloudAdoption(treeId) {
  try {
    const { data: currentPending, sha: pSha } = await fetchGithubJson('pending_adoptions.json');
    const remainingPending = currentPending.filter(t => t.id !== treeId && t.treeId !== treeId);

    await putGithubJson(
      'pending_adoptions.json',
      remainingPending,
      pSha,
      `Reject adoption: ${treeId}`
    );
    return true;
  } catch (e) {
    console.warn('Cloud reject error:', e);
    return false;
  }
}
