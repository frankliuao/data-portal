import React from 'react';
import PropTypes from 'prop-types';
import { Button, Steps } from 'antd';
import { gwasV2Steps } from '../constants';
import './ProgressBar.css';

const { Step } = Steps;
const ProgressBar = ({ current }) => (
  <div className='progress-bar'>
    <div className='progress-bar__steps'>
      <Steps current={current}>
        {gwasV2Steps.map((item, index) => (
          <Step
            key={item.title}
            icon={<React.Fragment>{index + 1}</React.Fragment>}
            title={`${current <= index ? item.title : item.secondaryTitle}`}
          />
        ))}
      </Steps>
    </div>
    <Button>New to GWAS? Get started here</Button>
  </div>
);

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
};

export default ProgressBar;