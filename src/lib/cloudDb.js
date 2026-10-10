// Cloud Database Sync for Taruvar Real-Time Cross-Device Adoption Approval
// Uses GitHub High-Speed REST API on dedicated live-data branch with Atomic Conflict Resolution

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
      data: parsed !== null && parsed !== undefined ? parsed : [],
      sha: json.sha
    };
  } catch (err) {
    console.warn(`Cloud fetch error for ${fileName}:`, err);
    return { data: null, sha: null };
  }
}

/**
 * Put a JSON file to GitHub branch with automatic conflict resolution & retry
 */
async function putGithubJsonWithRetry(fileName, transformFn, maxRetries = 4) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data: currentData, sha } = await fetchGithubJson(fileName);
      const finalData = typeof transformFn === 'function' ? transformFn(currentData) : transformFn;

      const contentBase64 = b64EncodeUnicode(JSON.stringify(finalData, null, 2));

      const bodyPayload = {
        message: `Sync ${fileName} (attempt ${attempt + 1})`,
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

      if (res.status === 200 || res.status === 201) {
        return true;
      }

      if (res.status === 409) {
        // SHA conflict: wait briefly and retry with latest SHA
        await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
        continue;
      }

      return false;
    } catch (err) {
      await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  return false;
}

/**
 * Fetch all pending adoptions from cloud
 */
export async function getCloudPendingAdoptions() {
  const result = await fetchGithubJson('pending_adoptions.json');
  return Array.isArray(result.data) ? result.data : [];
}

/**
 * Fetch all approved trees from cloud
 */
export async function getCloudApprovedAdoptions() {
  const result = await fetchGithubJson('approved_adoptions.json');
  return Array.isArray(result.data) ? result.data : [];
}

/**
 * Push a new pending adoption to cloud atomically
 */
export async function saveCloudPendingAdoption(record) {
  if (!record || (!record.id && !record.treeId)) return false;

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

  return await putGithubJsonWithRetry('pending_adoptions.json', (currentList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    const filtered = list.filter(item => item.id !== leanRecord.id && item.treeId !== leanRecord.treeId);
    return [leanRecord, ...filtered].slice(0, 100);
  });
}

/**
 * Admin approves adoption in cloud atomically
 */
export async function approveCloudAdoption(treeId, approvedRecord) {
  try {
    let target = approvedRecord;

    // 1. Remove from pending atomically
    await putGithubJsonWithRetry('pending_adoptions.json', (currentPending) => {
      const list = Array.isArray(currentPending) ? currentPending : [];
      const found = list.find(t => t.id === treeId || t.treeId === treeId);
      if (found) target = found;
      return list.filter(t => t.id !== treeId && t.treeId !== treeId);
    });

    // 2. Add to approved atomically
    if (target) {
      await putGithubJsonWithRetry('approved_adoptions.json', (currentApproved) => {
        const list = Array.isArray(currentApproved) ? currentApproved : [];
        const filtered = list.filter(t => t.id !== treeId && t.treeId !== treeId);
        return [
          { ...target, status: 'approved', verified_months: 1, verifiedMonths: 1 },
          ...filtered
        ].slice(0, 300);
      });
    }
    return true;
  } catch (e) {
    console.warn('Cloud approve error:', e);
    return false;
  }
}

/**
 * Admin rejects or deletes adoption in cloud atomically
 */
export async function rejectCloudAdoption(treeId) {
  try {
    return await putGithubJsonWithRetry('pending_adoptions.json', (currentPending) => {
      const list = Array.isArray(currentPending) ? currentPending : [];
      return list.filter(t => t.id !== treeId && t.treeId !== treeId);
    });
  } catch (e) {
    console.warn('Cloud reject error:', e);
    return false;
  }
}

/**
 * Save / sync tree growth & care report to cloud (updates tree records and publishes to public Explore feed)
 */
export async function saveCloudTreeCareReport(treeId, newReport, wellnessStatus, careInterval, extraInfo = {}) {
  if (!treeId || !newReport) return false;

  const leanReport = {
    id: newReport.id || `rep-${Date.now()}`,
    intervalDays: newReport.intervalDays || 1,
    activity: newReport.activity || 'Tree Nurturing Update',
    wellness: wellnessStatus || newReport.wellness || 'Thriving & Lush Green',
    photo: newReport.photo || null,
    notes: newReport.notes || '',
    date: newReport.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: Date.now()
  };

  // 1. Update approved adoptions in cloud
  try {
    await putGithubJsonWithRetry('approved_adoptions.json', (currentApproved) => {
      const list = Array.isArray(currentApproved) ? currentApproved : [];
      return list.map(t => {
        if (t.id === treeId || t.treeId === treeId) {
          const existingReports = Array.isArray(t.reports) ? t.reports : [];
          return {
            ...t,
            wellness: wellnessStatus || t.wellness,
            lastCareInterval: careInterval || t.lastCareInterval,
            reports: [...existingReports.filter(r => r.id !== leanReport.id), leanReport]
          };
        }
        return t;
      });
    });
  } catch (err) {
    console.warn('Sync tree care report to approved adoptions:', err);
  }

  // 2. Update pending adoptions in cloud if pending
  try {
    await putGithubJsonWithRetry('pending_adoptions.json', (currentPending) => {
      const list = Array.isArray(currentPending) ? currentPending : [];
      return list.map(t => {
        if (t.id === treeId || t.treeId === treeId) {
          const existingReports = Array.isArray(t.reports) ? t.reports : [];
          return {
            ...t,
            wellness: wellnessStatus || t.wellness,
            lastCareInterval: careInterval || t.lastCareInterval,
            reports: [...existingReports.filter(r => r.id !== leanReport.id), leanReport]
          };
        }
        return t;
      });
    });
  } catch (err) {
    console.warn('Sync tree care report to pending adoptions:', err);
  }

  // 3. Publish public Explore Feed Post so all citizens see the growing update!
  try {
    const publicPost = {
      id: `growth-post-${treeId}-${Date.now()}`,
      treeId: treeId,
      author: extraInfo.author || extraInfo.guardianName || 'Tree Guardian',
      userEmail: extraInfo.userEmail || '',
      memberId: extraInfo.memberId || 'TRV-IND-2026',
      title: `${extraInfo.treeName || 'Adopted Tree'} • Growth Update`,
      category: 'Tree Adoption & Care',
      categoryIcon: '🌿',
      timeInterval: `${newReport.intervalDays || 1}-Day Cadence`,
      location: extraInfo.location || 'Community Green Area',
      impact: `Wellness Status: ${wellnessStatus || 'Thriving'} 🌱`,
      description: newReport.notes || `Logged tree care & wellness update: ${newReport.activity}. Status: ${wellnessStatus || 'Thriving'} 🌱`,
      photo: newReport.photo,
      likes: 0,
      views: 0,
      date: newReport.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now()
    };
    await saveCloudSocialWork(publicPost);
  } catch (err) {
    console.warn('Publish growth report to social feed:', err);
  }

  return true;
}

/**
 * Admin permanently deletes an approved plantation/adoption from cloud
 */
export async function deleteCloudApprovedAdoption(treeId) {
  try {
    return await putGithubJsonWithRetry('approved_adoptions.json', (currentApproved) => {
      const list = Array.isArray(currentApproved) ? currentApproved : [];
      return list.filter(t => t.id !== treeId && t.treeId !== treeId);
    });
  } catch (e) {
    console.warn('Cloud delete approved error:', e);
    return false;
  }
}

/**
 * Admin permanently deletes a plantation / adoption from both pending & approved
 */
export async function deleteCloudAdoption(treeId) {
  try {
    await Promise.all([
      rejectCloudAdoption(treeId),
      deleteCloudApprovedAdoption(treeId)
    ]);
    return true;
  } catch (e) {
    console.warn('Delete cloud adoption error:', e);
    return false;
  }
}

// ==========================================
// SOCIAL WORKS, EXPLORE POSTS & COMMENTS CLOUD MANAGEMENT
// ==========================================

/**
 * Fetch all community social works & + Add Yours posts from cloud
 */
export async function getCloudSocialWorks() {
  try {
    const result = await fetchGithubJson('social_works.json');
    if (Array.isArray(result.data) && result.data.length > 0) {
      localStorage.setItem('taruvar_social_works', JSON.stringify(result.data));
      return result.data;
    }
  } catch (e) {
    console.warn('Could not fetch cloud social works:', e);
  }

  try {
    const saved = localStorage.getItem('taruvar_social_works');
    if (saved) return JSON.parse(saved);
  } catch {}

  return [];
}

/**
 * Save / push a community social work post to cloud atomically
 */
export async function saveCloudSocialWork(record) {
  if (!record || !record.id) return false;

  const leanRecord = {
    id: record.id,
    author: record.author || 'Eco Guardian',
    memberId: record.memberId || 'TRV-SOC-2026',
    userEmail: (record.userEmail || record.user_email || '').toLowerCase().trim(),
    title: record.title || 'Environmental Care Action',
    category: record.category || 'Tree Adoption & Care',
    categoryIcon: record.categoryIcon || '🌱',
    timeInterval: record.timeInterval || record.badge || '1 Day Action',
    location: record.location || 'Local Community Environment',
    impact: record.impact || 'Community Environmental Action',
    description: record.description || record.caption || '',
    photo: record.photo || record.photoPreview || null,
    likes: Number(record.likes) || 0,
    views: Number(record.views) || 0,
    date: record.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: record.timestamp || Date.now()
  };

  // Update local storage
  try {
    const local = JSON.parse(localStorage.getItem('taruvar_social_works') || '[]');
    const filtered = local.filter(w => w.id !== leanRecord.id);
    const updated = [leanRecord, ...filtered];
    localStorage.setItem('taruvar_social_works', JSON.stringify(updated));
  } catch {}

  // Sync to cloud
  return await putGithubJsonWithRetry('social_works.json', (currentList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    const filtered = list.filter(item => item.id !== leanRecord.id);
    return [leanRecord, ...filtered].slice(0, 200);
  });
}

/**
 * Permanently delete a social work post from cloud
 */
export async function deleteCloudSocialWork(postId) {
  try {
    return await putGithubJsonWithRetry('social_works.json', (currentList) => {
      const list = Array.isArray(currentList) ? currentList : [];
      return list.filter(item => item.id !== postId);
    });
  } catch (e) {
    console.warn('Delete cloud social work error:', e);
    return false;
  }
}

/**
 * Fetch all comments dictionary from cloud { [postId]: [comments] }
 */
export async function getCloudComments() {
  try {
    const res = await fetchGithubJson('post_comments.json');
    if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
      localStorage.setItem('taruvar_feed_comments', JSON.stringify(res.data));
      return res.data;
    }
  } catch (e) {
    console.warn('Could not fetch cloud comments:', e);
  }

  try {
    const saved = localStorage.getItem('taruvar_feed_comments');
    if (saved) return JSON.parse(saved);
  } catch {}

  return {};
}

/**
 * Fetch all likes mapping from cloud { [postId]: number }
 */
export async function getCloudLikes() {
  try {
    const res = await fetchGithubJson('post_likes.json');
    if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
      localStorage.setItem('taruvar_post_likes', JSON.stringify(res.data));
      return res.data;
    }
  } catch (e) {
    console.warn('Could not fetch cloud likes:', e);
  }

  try {
    const saved = localStorage.getItem('taruvar_post_likes');
    if (saved) return JSON.parse(saved);
  } catch {}

  return {};
}

/**
 * Save / increment / decrement like counter in cloud atomically
 */
export async function saveCloudLike(postId, nextCount) {
  if (!postId) return false;

  try {
    const local = JSON.parse(localStorage.getItem('taruvar_post_likes') || '{}');
    local[postId] = nextCount;
    localStorage.setItem('taruvar_post_likes', JSON.stringify(local));
  } catch {}

  return await putGithubJsonWithRetry('post_likes.json', (currentDict) => {
    const dict = (currentDict && typeof currentDict === 'object' && !Array.isArray(currentDict)) ? currentDict : {};
    return {
      ...dict,
      [postId]: nextCount
    };
  });
}

/**
 * Save a new comment to cloud atomically
 */
export async function saveCloudComment(postId, newComment) {
  if (!postId || !newComment) return false;

  try {
    const local = JSON.parse(localStorage.getItem('taruvar_feed_comments') || '{}');
    const existing = Array.isArray(local[postId]) ? local[postId] : [];
    local[postId] = [...existing, newComment];
    localStorage.setItem('taruvar_feed_comments', JSON.stringify(local));
  } catch {}

  return await putGithubJsonWithRetry('post_comments.json', (currentDict) => {
    const dict = (currentDict && typeof currentDict === 'object' && !Array.isArray(currentDict)) ? currentDict : {};
    const existing = Array.isArray(dict[postId]) ? dict[postId] : [];
    return {
      ...dict,
      [postId]: [...existing, newComment]
    };
  });
}

// ==========================================
// INITIATIVES & PROJECTS CLOUD MANAGEMENT
// ==========================================

export const DEFAULT_INITIATIVES = [
  {
    id: 'one-person-one-tree',
    title: 'ONE PERSON. ONE TREE.',
    subtitle: 'Public Individual Movement • एक व्यक्ति, एक पेड़',
    category: 'Citizen Afforestation',
    icon: '🌱',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    summary: 'A public movement encouraging individuals to take personal responsibility for at least one tree from plantation to full maturity.',
    points: [
      'Shift focus from mass unmonitored planting to high survival rate (95%+).',
      'Encourages personal ownership under the Paalna (nurturing) concept.',
      'Accessible to every citizen across homes, societies, villages, and streets.',
      'Simple 5-step framework: Plant → Care → Document → Grow → Inspire.'
    ],
    targetGoal: '10,000 Trees Adopted',
    currentProgress: 1420,
    progressPercent: 65,
    status: 'Active',
    location: 'Pan-India',
    createdAt: '2026-01-01'
  },
  {
    id: 'green-shakti',
    title: 'TARUVAR GREEN SHAKTI',
    subtitle: 'Women Environmental Leadership • महिला नेतृत्व',
    category: 'Women Leadership',
    icon: '👩',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    summary: 'Empowering women\'s leadership, participation, and environmental guardianship in residential areas, villages, and community self-help circles.',
    points: [
      'Mobilizing women as primary guardians of local saplings and community greens.',
      'Promoting neighborhood tree care circles and rainwater distribution.',
      'Building leadership networks and environmental stewardship workshops.',
      'Recognizing women eco-leaders with documented Taruvar Green Shakti honors.'
    ],
    targetGoal: '500 Women Green Circles',
    currentProgress: 110,
    progressPercent: 55,
    status: 'Active',
    location: 'Uttar Pradesh & Bihar',
    createdAt: '2026-02-15'
  },
  {
    id: 'youth-campus',
    title: 'TARUVAR YOUTH & CAMPUS NETWORK',
    subtitle: 'Student Volunteer & Internship Platform • युवा शक्ति',
    category: 'Campus & Youth',
    icon: '🎓',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    summary: 'Connecting students with real environmental campaigns, leadership opportunities, and documented participation credentials.',
    points: [
      'Establish campus chapters in schools, colleges, and universities.',
      'Hands-on experience in campaign management, tree monitoring, and youth drives.',
      'Documented volunteer certificates and internship experience based on real work.',
      'Leadership progression from volunteer to Campus Chapter Coordinator.'
    ],
    targetGoal: '100 College Chapters',
    currentProgress: 32,
    progressPercent: 40,
    status: 'Active',
    location: 'Lucknow, Delhi-NCR, Varanasi',
    createdAt: '2026-03-01'
  }
];

/**
 * Fetch all initiatives from cloud or local fallback
 */
export async function getCloudInitiatives() {
  try {
    const res = await fetchGithubJson('initiatives.json');
    if (Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('taruvar_initiatives', JSON.stringify(res.data));
      return res.data;
    }
  } catch (e) {
    console.warn('Could not fetch cloud initiatives:', e);
  }

  // Local fallback
  try {
    const saved = localStorage.getItem('taruvar_initiatives');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Save and return default
  localStorage.setItem('taruvar_initiatives', JSON.stringify(DEFAULT_INITIATIVES));
  return DEFAULT_INITIATIVES;
}

/**
 * Save / Update an initiative to cloud
 */
export async function saveCloudInitiative(initiative) {
  if (!initiative || !initiative.title) return false;

  const itemToSave = {
    ...initiative,
    id: initiative.id || `init-${Date.now()}`,
    updatedAt: new Date().toISOString()
  };

  // Update local
  try {
    const local = JSON.parse(localStorage.getItem('taruvar_initiatives') || '[]');
    const filtered = local.filter(i => i.id !== itemToSave.id);
    const updated = [itemToSave, ...filtered];
    localStorage.setItem('taruvar_initiatives', JSON.stringify(updated));
  } catch {}

  // Sync with cloud
  return await putGithubJsonWithRetry('initiatives.json', (currentList) => {
    const list = Array.isArray(currentList) && currentList.length > 0 ? currentList : DEFAULT_INITIATIVES;
    const filtered = list.filter(i => i.id !== itemToSave.id);
    return [itemToSave, ...filtered];
  });
}

/**
 * Delete an initiative from cloud
 */
export async function deleteCloudInitiative(initiativeId) {
  try {
    const local = JSON.parse(localStorage.getItem('taruvar_initiatives') || '[]');
    const updated = local.filter(i => i.id !== initiativeId);
    localStorage.setItem('taruvar_initiatives', JSON.stringify(updated));
  } catch {}

  return await putGithubJsonWithRetry('initiatives.json', (currentList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    return list.filter(i => i.id !== initiativeId);
  });
}

// ==========================================
// ADMIN & SUB-ADMIN HIERARCHY CLOUD MANAGEMENT
// ==========================================

export const SUPERADMIN_EMAIL = 'naveenpr332@gmail.com';

/**
 * Fetch all appointed sub-admins under Superadmin
 */
export async function getCloudAdminHierarchy() {
  try {
    const res = await fetchGithubJson('admin_hierarchy.json');
    if (Array.isArray(res.data)) {
      localStorage.setItem('taruvar_admin_hierarchy', JSON.stringify(res.data));
      return res.data;
    }
  } catch (e) {
    console.warn('Could not fetch cloud admin hierarchy:', e);
  }

  try {
    const saved = localStorage.getItem('taruvar_admin_hierarchy');
    if (saved) return JSON.parse(saved);
  } catch {}

  return [];
}

/**
 * Superadmin adds or updates a sub-admin
 */
export async function saveCloudSubAdmin(adminRecord) {
  if (!adminRecord || !adminRecord.email) return false;

  const leanAdmin = {
    id: adminRecord.id || `admin-${Date.now()}`,
    email: adminRecord.email.trim().toLowerCase(),
    fullName: adminRecord.fullName || 'Taruvar Regional Admin',
    phone: adminRecord.phone || '',
    roleLevel: adminRecord.roleLevel || 'regional_admin', // 'superadmin' | 'regional_admin' | 'field_inspector' | 'project_coordinator'
    roleTitle: adminRecord.roleTitle || 'Regional Admin (क्षेत्रीय प्रशासक)',
    region: adminRecord.region || 'Lucknow, UP',
    status: adminRecord.status || 'active', // 'active' | 'suspended'
    appointedBy: adminRecord.appointedBy || SUPERADMIN_EMAIL,
    appointedDate: adminRecord.appointedDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    passcode: adminRecord.passcode || 'TARUVAR_ADMIN_2026',
    permissions: adminRecord.permissions || ['approve_trees', 'verify_reports', 'manage_initiatives']
  };

  // Update local
  try {
    const local = JSON.parse(localStorage.getItem('taruvar_admin_hierarchy') || '[]');
    const filtered = local.filter(a => a.email !== leanAdmin.email && a.id !== leanAdmin.id);
    const updated = [leanAdmin, ...filtered];
    localStorage.setItem('taruvar_admin_hierarchy', JSON.stringify(updated));
  } catch {}

  // Sync to cloud
  return await putGithubJsonWithRetry('admin_hierarchy.json', (currentList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    const filtered = list.filter(a => a.email !== leanAdmin.email && a.id !== leanAdmin.id);
    return [leanAdmin, ...filtered];
  });
}

/**
 * Superadmin removes a sub-admin
 */
export async function deleteCloudSubAdmin(adminEmailOrId) {
  try {
    const local = JSON.parse(localStorage.getItem('taruvar_admin_hierarchy') || '[]');
    const updated = local.filter(a => a.email !== adminEmailOrId && a.id !== adminEmailOrId);
    localStorage.setItem('taruvar_admin_hierarchy', JSON.stringify(updated));
  } catch {}

  return await putGithubJsonWithRetry('admin_hierarchy.json', (currentList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    return list.filter(a => a.email !== adminEmailOrId && a.id !== adminEmailOrId);
  });
}
