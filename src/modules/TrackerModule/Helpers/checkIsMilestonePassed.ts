import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';

export default function checkIsMilestonePassed(
  currentMilestoneId?: string | null,
  triggerMilestoneName?: string | null,
  milestones?: MILESTONE[],
) {
  if (!currentMilestoneId || !triggerMilestoneName || !milestones) {
    return false;
  }

  const triggerMilestoneIndex = milestones.findIndex(
    milestone =>
      milestone.displayName?.toLowerCase() ===
      triggerMilestoneName?.toLowerCase(),
  );

  const currentMilestoneIndex = milestones.findIndex(
    milestone => milestone.milestoneId === currentMilestoneId,
  );

  return currentMilestoneIndex > triggerMilestoneIndex;
}
