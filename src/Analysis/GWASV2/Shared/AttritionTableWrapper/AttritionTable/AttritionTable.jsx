import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';
import AttritionTableRow from './AttritionTableRow';
import './AttritionTable.css';

const { Panel } = Collapse;

const AttritionTable = ({
  selectedCohort, outcome, covariates, tableType,
}) => {
  const [covariatesProcessed, setCovariatesProcessed] = useState([]);
  // Creates an array of arrays such that given input arr [A,B,C]
  // it returns arr [[A], [A,B], [A,B,C]]
  const getCovariateRow = (inputArr) => {
    const outputArr = [];
    const prevArr = [];
    inputArr.forEach((item, index) => {
      prevArr.push(inputArr[index]);
      outputArr.push([...prevArr]);
    });
    return outputArr;
  };

  useEffect(() => {
    setCovariatesProcessed(getCovariateRow(covariates));
  }, [covariates]);

  const applyAutoGenFilters = () => {
    if (tableType === 'Case Cohort') {
      return {
        variable_type: 'custom_dichotomous',
        cohort_ids: [
          selectedCohort.cohort_definition_id,
          outcome.cohort_ids[0],
        ],
        provided_name:
          'Autogenerated variable for filtering out Control Population',
      };
    }
    if (tableType === 'Control Cohort') {
      return {
        variable_type: 'custom_dichotomous',
        cohort_ids: [
          selectedCohort.cohort_definition_id,
          outcome.cohort_ids[1],
        ],
        provided_name:
          'Autogenerated variable for filtering out Case Population',
      };
    }
    return {};
  };

  return (
    <div className='gwasv2-attrition-table' key={tableType}>
      <Collapse onClick={(event) => event.stopPropagation()}>
        <Panel header={`${tableType} Attrition Table`} key='2'>
          <table>
            <thead>
              <tr>
                <th className='gwasv2-attrition-table--leftpad gwasv2-attrition-table--w15'>
                  Type
                </th>
                <th className='gwasv2-attrition-table--w5'>Chart</th>
                <th className='gwasv2-attrition-table--w15'>Name</th>
                <th
                  className='gwasv2-attrition-table--rightborder
                gwasv2-attrition-table--w5'
                >
                  Size
                </th>
                <th
                  className='gwasv2-attrition-table--w15
                gwasv2-attrition-table--leftpad'
                >
                  Non-Hispanic Black
                </th>
                <th className='gwasv2-attrition-table--w15'>
                  Non-Hispanic Asian
                </th>
                <th className='gwasv2-attrition-table--w15'>
                  Non-Hispanic White
                </th>
                <th className='gwasv2-attrition-table--w15'>Hispanic</th>
              </tr>
            </thead>
            <tbody>
              {selectedCohort?.cohort_definition_id && (
                <React.Fragment key={selectedCohort}>
                  {/* This is for the first Cohort Row in the Table */}
                  <AttritionTableRow
                    selectedCohort={selectedCohort}
                    outcome={null}
                    rowType='Cohort'
                    rowObject={null}
                    currentCovariateAndCovariatesFromPrecedingRows={[]}
                  />
                </React.Fragment>
              )}
              {outcome && (
                <React.Fragment key={tableType}>
                  {/* This is for the outcome Row in the Table */}
                  <AttritionTableRow
                    selectedCohort={selectedCohort}
                    rowType='Outcome'
                    outcome={outcome}
                    rowObject={outcome}
                    currentCovariateAndCovariatesFromPrecedingRows={[
                      applyAutoGenFilters(),
                    ]}
                  />
                </React.Fragment>
              )}
              {selectedCohort?.cohort_definition_id
              && outcome && covariatesProcessed.length > 0
                ? covariatesProcessed.map((item) => (
                  <React.Fragment key={item}>
                    {/* This is for all the covariate rows in the table */}
                    <AttritionTableRow
                      key={item}
                      outcome={outcome}
                      // use the last item
                      rowObject={item[item.length - 1]}
                      selectedCohort={selectedCohort}
                      rowType='Covariate'
                      currentCovariateAndCovariatesFromPrecedingRows={[
                        ...item,
                        applyAutoGenFilters(),
                      ]}
                    />
                  </React.Fragment>
                ))
                : null}
            </tbody>
          </table>
        </Panel>
      </Collapse>
    </div>
  );
};

AttritionTable.propTypes = {
  selectedCohort: PropTypes.object,
  outcome: PropTypes.object,
  covariates: PropTypes.array,
  tableType: PropTypes.string.isRequired,
};

AttritionTable.defaultProps = {
  selectedCohort: undefined,
  outcome: null,
  covariates: [],
};

export default AttritionTable;
