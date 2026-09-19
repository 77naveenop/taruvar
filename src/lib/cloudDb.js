// Cloud Database Sync for Taruvar Real-Time Cross-Device Adoption Approval
// Bucket IDs on RESTful object store
const PENDING_BUCKET_ID = 'ff808181a09d98f701a0b96d2fcd4632';
const APPROVED_BUCKET_ID = 'ff808181a09d98f701a0b96dace44634';

const API_BASE = 'https://api.restful-api.dev/objects';

/**
 * Fetch all pending adoptions from cloud
 */
export async function getCloudPendingAdoptions() {
  try {
    const res = await fetch(`${API_BASE}/${PENDING_BUCKET_ID}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.adoptions || [];
  } catch (e) {
    console.warn('Cloud pending fetch note:', e);
    return [];
  }
}

/**
 * Fetch all approved trees from cloud
 */
export async function getCloudApprovedAdoptions() {
  try {
    const res = await fetch(`${API_BASE}/${APPROVED_BUCKET_ID}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.adoptions || [];
  } catch (e) {
    console.warn('Cloud approved fetch note:', e);
    return [];
  }
}

/**
 * Push a new pending adoption to cloud
 */
export async function saveCloudPendingAdoption(record) {
  try {
    const current = await getCloudPendingAdoptions();
    // Deduplicate
    const filtered = current.filter(item => item.id !== record.id && item.treeId !== record.treeId);
    
    // Create lean record to avoid HTTP payload limits (compress/limit large base64 if needed)
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
      plantedDate: record.plantedDate || record.planted_date || new Date().toLocaleDateString('en-GB'),
      planted_date: record.planted_date || record.plantedDate || new Date().toLocaleDateString('en-GB'),
      timestamp: Date.now()
    };

    const updated = [leanRecord, ...filtered].slice(0, 100); // keep recent 100

    await fetch(`${API_BASE}/${PENDING_BUCKET_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Taruvar_Pending_Adoptions',
        data: { adoptions: updated }
      })
    });
    return true;
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
    const currentPending = await getCloudPendingAdoptions();
    const target = currentPending.find(t => t.id === treeId || t.treeId === treeId) || approvedRecord;
    const remainingPending = currentPending.filter(t => t.id !== treeId && t.treeId !== treeId);

    await fetch(`${API_BASE}/${PENDING_BUCKET_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Taruvar_Pending_Adoptions',
        data: { adoptions: remainingPending }
      })
    });

    // 2. Add to approved
    if (target) {
      const currentApproved = await getCloudApprovedAdoptions();
      const filteredApproved = currentApproved.filter(t => t.id !== treeId && t.treeId !== treeId);
      const updatedApproved = [{ ...target, status: 'approved', verified_months: 1 }, ...filteredApproved].slice(0, 200);

      await fetch(`${API_BASE}/${APPROVED_BUCKET_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Taruvar_Approved_Adoptions',
          data: { adoptions: updatedApproved }
        })
      });
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
    const currentPending = await getCloudPendingAdoptions();
    const remainingPending = currentPending.filter(t => t.id !== treeId && t.treeId !== treeId);

    await fetch(`${API_BASE}/${PENDING_BUCKET_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Taruvar_Pending_Adoptions',
        data: { adoptions: remainingPending }
      })
    });
    return true;
  } catch (e) {
    console.warn('Cloud reject error:', e);
    return false;
  }
}
