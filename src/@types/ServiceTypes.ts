export interface ServiceTypeProps {
  name: string;
  id: string;
  localId: string;
  description: string;
  period?: string;
  executionTime?: string;
  priority?: string;
  team?: string;
  serviceCondition?: string;
  lubricantNeeded?: string;
  jobSystem?: string;
  lubricantAmount?: string;
  lubricantPoints?: string;
  estimatedFinishTime?: string;
  extraTeam?: string;
  estimatedExtraTeamTime?: string;
}
