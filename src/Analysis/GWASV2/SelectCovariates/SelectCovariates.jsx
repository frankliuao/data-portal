import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import ContinuousCovariates from '../Shared/GWASCovariates/ContinuousCovariates';
import CustomDichotomousCovariates from '../Shared/GWASCovariates/CustomDichotomousCovariates';

const SelectCovariates = ({
  handleCovariateSelect,
  handleCovariateSubmit,
  selectedCovariate = undefined,
  allCovariates,
  sourceId,
  current,
}) => {
  const [mode, setMode] = useState(undefined);
  return (
    <React.Fragment>
      {mode === 'continuous'
        // todo: add filter to allCovariates : .filter((cov) => concept_id in cov)
        && (
          <ContinuousCovariates
            handleSubmit={handleCovariateSubmit}
            handleSelect={handleCovariateSelect}
            selected={selectedCovariate}
            covariates={allCovariates}
            sourceId={sourceId}
            setMode={setMode}
          />
        )}
      {mode === 'dichotomous'
        // todo: add filter to allCovariates : .filter((cov) => provided_name in cov)
        && (
          <CustomDichotomousCovariates
            handleSubmit={handleSubmit}
            // selected={selectedCovariate}
            covariates={allCovariates}
            sourceId={sourceId}
            setMode={setMode}
            current={current}
          />
        )}
      {!mode && (
        <div>
          <button
            type='button'
            style={{
              height: 60,
              marginRight: 5
            }}
            onClick={() =>
            setMode('continuous')}>
            Add Continuous Outcome Covariate
          </button>
          <button
            type='button'
            style={{
              height: 60,
              marginLeft: 5
            }}
            onClick={() => setMode('dichotomous')}>
            Add Dichotomous Outcome Covariate
          </button>
        </div>
      )}
    </React.Fragment>
  );
};

SelectCovariates.propTypes = {
  handleCovariateSubmit: PropTypes.func.isRequired,
  handleCovariateSelect: PropTypes.func.isRequired,
  sourceId: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  allCovariates: PropTypes.array.isRequired
};

SelectCovariates.defaultProps = {
  selectedCovariate: undefined,
};

export default SelectCovariates;