import React, { useState } from 'react';
import { Button, SimpleGrid } from '@mantine/core';

const TableRow = ({
  TableDataTotal,
  rowObject,
  columnsShown,
  searchInputValue,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const outputValueAndPercentage = (value) => (
    <React.Fragment>
      {value}
      <br />
      {Math.trunc((value / TableDataTotal) * 100 * 100) / 100}%
    </React.Fragment>
  );

  const checkIfCellContainsSearchTerm = (cellText) => {
    if (
      searchInputValue
      && cellText
        .toString()
        .toLowerCase()
        .includes(searchInputValue.toLowerCase().trim())
    ) {
      return 'search-border';
    }
    return false;
  };

  const checkIfDetailTableContainsSearchTerm = (rowObject) => {
    let searchTermFound = false;
    const hiddenKeys = [
      'minValue',
      'maxValue',
      'meanValue',
      'standardDeviation',
    ];
    hiddenKeys.forEach((keyString) => {
      if (checkIfCellContainsSearchTerm(rowObject[keyString])) {
        searchTermFound = true;
      }
    });
    if (searchTermFound) return 'search-border';
    return '';
  };
  const checkIfChartContainsSearchTerm = (rowObject) => {
    let searchTermFound = false;
    rowObject.valueSummary.forEach((arrObj) => {
      Object.values(arrObj).forEach((arrObjVal) => {
        if (checkIfCellContainsSearchTerm(arrObjVal)) {
          searchTermFound = true;
        }
      });
    });
    if (searchTermFound) return 'search-border';
    return '';
  };

  const checkIfHiddenCellsContainSearchTerm = (rowObject) => {
    if (checkIfDetailTableContainsSearchTerm(rowObject)) return 'search-border';
    if (checkIfChartContainsSearchTerm(rowObject)) return 'search-border';
    return false;
  };

  return (
    <React.Fragment key={rowObject.vocabularyID}>
      <tr colSpan={columnsShown}>
        <td className={checkIfCellContainsSearchTerm(rowObject.vocabularyID)}>
          {rowObject.vocabularyID}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.conceptID.toString(),
          )}
        >
          {rowObject.conceptID}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.conceptCode.toString(),
          )}
        >
          {rowObject.conceptCode}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.conceptName.toString(),
          )}
        >
          {rowObject.conceptName}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.conceptClassID.toString(),
          )}
        >
          {rowObject.conceptClassID}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.numberOfPeopleWithVariable,
          )}
        >
          {outputValueAndPercentage(rowObject.numberOfPeopleWithVariable)}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.numberOfPeopleWhereValueIsFilled,
          )}
        >
          {outputValueAndPercentage(rowObject.numberOfPeopleWhereValueIsFilled)}
        </td>
        <td
          className={checkIfCellContainsSearchTerm(
            rowObject.numberOfPeopleWhereValueIsNull,
          )}
        >
          {outputValueAndPercentage(rowObject.numberOfPeopleWhereValueIsNull)}
        </td>
        <td className={checkIfCellContainsSearchTerm(rowObject.valueStoredAs)}>
          {rowObject.valueStoredAs}
        </td>
        <td className={checkIfHiddenCellsContainSearchTerm(rowObject)}>
          {!showDetails && (
            <Button variant='filled' onClick={() => setShowDetails(true)}>
              Show More
            </Button>
          )}
          {showDetails && (
            <Button variant='filled' onClick={() => setShowDetails(false)}>
              Hide Details
            </Button>
          )}
        </td>
      </tr>
      <tr className={`expandable ${showDetails ? 'expanded' : ''}`}>
        <td colSpan={columnsShown}>
          <div className={`expandable ${showDetails ? 'expanded' : ''}`}>
            <SimpleGrid cols={2}>
              <div
                style={{ marginLeft: '1em', padding: '1em' }}
                className={checkIfChartContainsSearchTerm(rowObject)}
              >
                <h3>Value Summary</h3>
                {JSON.stringify(rowObject.valueSummary)}
                <br />
              </div>
              <div
                style={{
                  marginRight: '1em',
                  padding: '1em',
                  borderLeft: '2px solid navy',
                }}
                className={checkIfDetailTableContainsSearchTerm(rowObject)}
              >
                <h3>Additional Data</h3>
                <br />
                minValue: {rowObject.minValue}
                <br />
                maxValue: {rowObject.maxValue}
                <br />
                meanValue: {rowObject.meanValue}
                <br />
                standardDeviation: {rowObject.standardDeviation}
              </div>
            </SimpleGrid>
          </div>
        </td>
      </tr>
    </React.Fragment>
  );
};

export default TableRow;
