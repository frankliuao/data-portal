import { gwasWorkflowPath } from '../../../localconf';
import { headers } from '../../../configs';

export const useGwasSubmitCC = async (
  sourceId,
  numOfPC,
  selectedCovariates,
  selectedDichotomousCovariates,
  selectedHare,
  mafThreshold,
  imputationScore,
  selectedCaseCohort,
  selectedControlCohort,
  gwasName,
) => {
  const submitEndpoint = `${gwasWorkflowPath}submit`;
  const requestBody = {
    n_pcs: numOfPC,
    variables: [...selectedCovariates, ...selectedDichotomousCovariates],
    out_prefix: Date.now().toString(),
    outcome: '-1',
    hare_population: selectedHare.concept_value,
    hare_concept_id: 2000007027,
    maf_threshold: Number(mafThreshold),
    imputation_score_cutoff: Number(imputationScore),
    template_version: 'gwas-template-latest',
    source_id: sourceId,
    case_cohort_definition_id: selectedCaseCohort.cohort_definition_id,
    control_cohort_definition_id: selectedControlCohort.cohort_definition_id,
    workflow_name: gwasName,
  };
  const res = await fetch(submitEndpoint, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(requestBody),
  });
  return res;
};

export const useGwasSubmitQ = async (
  sourceId,
  numOfPC,
  selectedCovariates,
  selectedDichotomousCovariates,
  outcome,
  selectedHare,
  mafThreshold,
  imputationScore,
  selectedQuantitativeCohort,
  gwasName,
) => {
  const submitEndpoint = `${gwasWorkflowPath}submit`;
  const requestBody = {
    n_pcs: numOfPC,
    variables: [...selectedCovariates, ...selectedDichotomousCovariates],
    out_prefix: Date.now().toString(),
    outcome: outcome.concept_id,
    hare_population: selectedHare.concept_value,
    hare_concept_id: 2000007027,
    maf_threshold: Number(mafThreshold),
    imputation_score_cutoff: Number(imputationScore),
    template_version: 'gwas-template-latest',
    source_id: sourceId,
    case_cohort_definition_id: selectedQuantitativeCohort.cohort_definition_id,
    control_cohort_definition_id: '-1',
    workflow_name: gwasName,
  };
  const res = await fetch(submitEndpoint, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(requestBody),
  });
  return res;
};
