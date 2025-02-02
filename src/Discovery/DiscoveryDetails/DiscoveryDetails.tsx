import React, { useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Space,
  Collapse,
  List,
  Tabs,
  Divider,
} from 'antd';
import {
  LinkOutlined,
  CheckOutlined,
  UnlockOutlined,
  DoubleLeftOutlined,
  DownloadOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import jsonpath from 'jsonpath';
import { useHistory } from 'react-router-dom';
import {
  hostname,
  basename,
  fenceDownloadPath,
  studyRegistrationConfig,
} from '../../localconf';
import { DiscoveryConfig } from '../DiscoveryConfig';
import DataDownloadList from './DataDownloadList/DataDownloadList';
import {
  AccessLevel,
  accessibleFieldName,
  renderFieldContent,
  DiscoveryResource,
} from '../Discovery';
import { userHasMethodForServiceOnResource } from '../../authMappingUtils';
import CheckHealLoginNeeded from './Utils/CheckHealLoginNeeded';

const { Panel } = Collapse;

interface Props {
  modalVisible: boolean;
  setModalVisible: (boolean) => void;
  setPermalinkCopied: (boolean) => void;
  modalData: DiscoveryResource;
  config: DiscoveryConfig;
  permalinkCopied: boolean;
  user: User;
  userAuthMapping: any;
  systemPopupActivated: boolean;
}

interface ListItem {
  title: string;
  description: string;
  guid: string;
}

interface LinkItem {
  title?: string;
  link: string;
}

interface User {
  username: string;
  fence_idp?: string; // eslint-disable-line camelcase
}

const fieldCls = { className: 'discovery-modal__field' };
const withLabelFieldCls = {
  className: 'discovery-modal__field discovery-modal__field--with_label',
};
const blockFieldCls = {
  className: 'discovery-modal__field discovery-modal__field--block',
};
const subHeadingCls = { className: 'discovery-modal__subheading' };
const fieldGroupingClass = { className: 'discovery-modal__fieldgroup' };
const labelCls = { className: 'discovery-modal__fieldlabel' };
const textCls = { className: 'discovery-modal__fieldtext' };
const tagsCls = { className: 'discovery-modal__tagsfield' };
const tabLabelCls = { className: 'discovery-modal__tablabel' };

const getFieldCls = (label?: string) => (label ? withLabelFieldCls : fieldCls);

const blockTextField = (text: string) => <div {...blockFieldCls}>{text}</div>;
const label = (text: string) => (text ? <b {...labelCls}>{text}</b> : <div />);
const textField = (text: string) => <span {...textCls}>{text}</span>;
const linkField = (text: string, title?: string) => (
  <a href={text} target='_blank' rel='noreferrer'>
    {title || text}
  </a>
);

const subHeading = (text: string) => <h3 {...subHeadingCls}>{text}</h3>;
const labeledSingleTextField = (labelText: string, fieldText: string) => (
  <div {...getFieldCls(labelText)}>
    {label(labelText)} {textField(fieldText)}
  </div>
);
const labeledMultipleTextField = (labelText: string, fieldsText: string[]) => (fieldsText.length ? (
  <div>
    {[
      // labeled first field
      <div {...getFieldCls(labelText)} key='root'>
        {label(labelText)} {textField(fieldsText[0])}
      </div>,
      // unlabeled subsequent fields
      ...fieldsText.slice(1).map((text, i) => (
        <div {...getFieldCls(labelText)} key={i}>
          <div /> {textField(text)}
        </div>
      )),
    ]}
  </div>
) : null);
const labeledSingleLinkField = (
  labelText: string,
  linkObject: LinkItem | string,
) => {
  if (typeof linkObject === 'string') {
    return (
      <div {...getFieldCls(labelText)}>
        {label(labelText)} {linkField(linkObject, linkObject)}
      </div>
    );
  }
  return (
    <div {...getFieldCls(labelText)}>
      {label(labelText)} {linkField(linkObject.link, linkObject.title)}
    </div>
  );
};
const labeledMultipleLinkField = (
  labelText: string,
  links: LinkItem[] | string[],
) => {
  if (!links.length) {
    return null;
  }
  if (typeof links === 'string') {
    return (
      <div {...getFieldCls(labelText)}>
        {label(labelText)} {linkField(links, links)}
      </div>
    );
  }
  if (typeof links[0] === 'string') {
    return (
      <div>
        {[
          // labeled first field
          <div {...getFieldCls(labelText)} key='root'>
            {label(labelText)} {linkField(links[0], links[0])}
          </div>,
          // unlabeled subsequent fields
          ...links.slice(1).map((linkText, i) => (
            <div {...getFieldCls(labelText)} key={i}>
              <div /> {linkField(linkText)}
            </div>
          )),
        ]}
      </div>
    );
  }
  // if links is an array of objects in the format of { link: aaa, title: bbb }
  return (
    <div>
      {[
        // labeled first field
        <div {...getFieldCls(labelText)} key='root'>
          {label(labelText)} {linkField(links[0].link, links[0].title)}
        </div>,
        // unlabeled subsequent fields
        ...links.slice(1)?.map((linkObject, i) => (
          <div {...getFieldCls(labelText)} key={i}>
            <div /> {linkField(linkObject.link, linkObject.title)}
          </div>
        )),
      ]}
    </div>
  );
};

const accessDescriptor = (resource: DiscoveryResource) => {
  if (resource[accessibleFieldName] === AccessLevel.ACCESSIBLE) {
    return (
      <Alert
        className='discovery-modal__access-alert'
        type='success'
        message={(
          <React.Fragment>
            <UnlockOutlined /> You have access to this data.
          </React.Fragment>
        )}
      />
    );
  }
  if (resource[accessibleFieldName] === AccessLevel.UNACCESSIBLE) {
    return (
      <Alert
        className='discovery-modal__access-alert'
        type='warning'
        message={
          <React.Fragment>You do not have access to this data.</React.Fragment>
        }
      />
    );
  }
  return (
    <Alert
      className='discovery-modal__access-alert'
      type='info'
      message={(
        <React.Fragment>
          This does not include data access authorization details.
        </React.Fragment>
      )}
    />
  );
};

type TabFieldConfig = TabFieldGroup['fields'][0];
type TabFieldGroup = DiscoveryConfig['detailView']['tabs'][0]['groups'][0];

const formatResourceValuesWhenNestedArray = (
  resourceFieldValue: string | any[],
) => {
  if (Array.isArray(resourceFieldValue)) {
    if (
      Array.isArray(resourceFieldValue[0])
      && resourceFieldValue[0].every((val) => typeof val === 'string')
    ) {
      return resourceFieldValue[0].join(', ');
    }
    return resourceFieldValue[0];
  }
  return resourceFieldValue;
};

const tabField = (
  user: User,
  fieldConfig: TabFieldConfig,
  discoveryConfig: DiscoveryConfig,
  resource: DiscoveryResource,
): JSX.Element | null => {
  // Setup special fields first
  if (fieldConfig.type === 'accessDescriptor') {
    return accessDescriptor(resource);
  }
  if (fieldConfig.type === 'tags') {
    const tags = fieldConfig.categories
      ? (resource.tags || []).filter((tag) => fieldConfig.categories?.includes(tag.category),
      )
      : resource.tags;
    return (
      <div {...tagsCls}>
        {renderFieldContent(tags, 'tags', discoveryConfig)}
      </div>
    );
  }
  // Here begins some normal fields (texts, links, etc...)
  let resourceFieldValue = fieldConfig.sourceField
    && jsonpath.query(resource, `$.${fieldConfig.sourceField}`);
  if (
    resourceFieldValue
    && resourceFieldValue.length > 0
    && resourceFieldValue[0]
    && resourceFieldValue[0].length !== 0
  ) {
    if (fieldConfig.type === 'dataDownloadList') {
      return (
        <DataDownloadList
          isUserLoggedIn={Boolean(user.username)}
          discoveryConfig={discoveryConfig}
          resourceInfo={resource}
          sourceFieldData={resourceFieldValue}
          healLoginNeeded={CheckHealLoginNeeded([resource], user.fence_idp)}
        />
      );
    }
    // Format resourceFieldValue for all other field types
    resourceFieldValue = formatResourceValuesWhenNestedArray(resourceFieldValue);

    if (fieldConfig.type === 'text') {
      return labeledSingleTextField(fieldConfig.label, resourceFieldValue);
    }
    if (fieldConfig.type === 'link') {
      return labeledSingleLinkField(fieldConfig.label, resourceFieldValue);
    }
    if (fieldConfig.type === 'textList') {
      return labeledMultipleTextField(fieldConfig.label, resourceFieldValue);
    }
    if (fieldConfig.type === 'linkList') {
      return labeledMultipleLinkField(fieldConfig.label, resourceFieldValue);
    }
    if (fieldConfig.type === 'block') {
      return blockTextField(resourceFieldValue);
    }
  }
  return null;
};

const fieldGrouping = (
  user: User,
  group: TabFieldGroup,
  discoveryConfig: DiscoveryConfig,
  resource: DiscoveryResource,
) => {
  // at least one field from this group is either populated in the resource, or isn't configured to pull from a field (e.g. tags)
  const groupHasContent = group.fields.some((field) => {
    // For special fields (tags, access descriptors, etc...)
    if (!field.sourceField) {
      return true;
    }
    const resourceFieldValue = jsonpath.query(
      resource,
      `$.${field.sourceField}`,
    );
    return (
      resourceFieldValue
      && resourceFieldValue.length > 0
      && resourceFieldValue[0]
      && resourceFieldValue[0].length !== 0
    );
  });
  if (groupHasContent) {
    return (
      <div {...fieldGroupingClass}>
        {group.header ? subHeading(group.header) : null}
        {group.fields.map((field, i) => (
          <div key={i}>{tabField(user, field, discoveryConfig, resource)}</div>
        ))}
      </div>
    );
  }

  return <React.Fragment />;
};

const DiscoveryDetails = (props: Props) => {
  const [tabActiveKey, setTabActiveKey] = useState('0');

  const history = useHistory();
  const pagePath = `/discovery/${encodeURIComponent(
    props.modalData[props.config.minimalFieldMapping.uid],
  )}/`;
  const permalink = `${basename === '/' ? '' : basename}${pagePath}`;

  const handleRedirectClick = (
    redirectURL: string = '/',
    studyRegistrationAuthZ: string | null = null,
    studyName: string | null = null,
    studyNumber: string | null = null,
    studyUID: string | number | null = null,
    existingDataDictionaryName: Array<string> = [],
  ) => {
    history.push(redirectURL, {
      studyName,
      studyNumber,
      studyRegistrationAuthZ,
      studyUID,
      existingDataDictionaryName,
    });
  };

  const handleRedirectToLoginClick = () => {
    history.push('/login', { from: pagePath });
  };

  const headerField = props.config.detailView?.headerField
    || props.config.studyPageFields.header?.field
    || '';
  const header = (
    <Space align='baseline'>
      <h3 className='discovery-modal__header-text'>
        {jsonpath.query(props.modalData, `$.${headerField}`)}
      </h3>
    </Space>
  );

  return (
    <Drawer
      className='discovery-modal'
      // if system-level popup is visible, do not show details drawer
      open={props.modalVisible && !props.systemPopupActivated}
      width={'50vw'}
      closable={false}
      onClose={() => {
        props.setModalVisible(false);
        setTabActiveKey('0');
      }}
    >
      <div className='discovery-modal__header-buttons'>
        <Button
          type='text'
          onClick={() => {
            props.setModalVisible(false);
            setTabActiveKey('0');
          }}
          className='discovery-modal__close-button'
        >
          <DoubleLeftOutlined />
          Back
        </Button>
        <Space split={<Divider type='vertical' />}>
          {props.modalData[
            studyRegistrationConfig.studyRegistrationValidationField
          ] === false ? (
              <Button
                type='text'
                className='discovery-modal__request-button'
                onClick={() => {
                  if (props.user.username) {
                    if (
                      userHasMethodForServiceOnResource(
                        'access',
                        'study_registration',
                        props.modalData[
                          studyRegistrationConfig
                            .studyRegistrationAccessCheckField
                        ],
                        props.userAuthMapping,
                      )
                    ) {
                      return handleRedirectClick(
                        '/study-reg',
                        props.modalData[
                          studyRegistrationConfig
                            .studyRegistrationAccessCheckField
                        ],
                        props.modalData.project_title,
                        props.modalData.project_number,
                        props.modalData[
                          studyRegistrationConfig.studyRegistrationUIDField
                        ],
                      );
                    }
                    return handleRedirectClick(
                      '/study-reg/request-access',
                      props.modalData[
                        studyRegistrationConfig.studyRegistrationAccessCheckField
                      ],
                      props.modalData.project_title,
                      props.modalData.project_number,
                      props.modalData[
                        studyRegistrationConfig.studyRegistrationUIDField
                      ],
                    );
                  }
                  return handleRedirectToLoginClick();
                }}
              >
                <React.Fragment>
                  <AuditOutlined />
                  {(() => {
                    if (props.user.username) {
                      if (
                        userHasMethodForServiceOnResource(
                          'access',
                          'study_registration',
                          props.modalData[
                            studyRegistrationConfig
                              ?.studyRegistrationAccessCheckField
                          ],
                          props.userAuthMapping,
                        )
                      ) {
                        return ' Register This Study ';
                      }
                      return ' Request Access to Register This Study ';
                    }
                    return ' Login to Register This Study ';
                  })()}
                </React.Fragment>
              </Button>
            ) : null}
          {props.modalData[
            studyRegistrationConfig.studyRegistrationValidationField
          ]
          && props.user.username
          && userHasMethodForServiceOnResource(
            'access',
            'study_registration',
            props.modalData[
              studyRegistrationConfig.studyRegistrationAccessCheckField
            ],
            props.userAuthMapping,
          ) ? (
            // user is authenticated, VLMD submission button should be visible only on registered studies that they have access to
              <Button
                type='text'
                className='discovery-modal__request-button'
                onClick={() => handleRedirectClick(
                  '/data-dictionary-submission',
                  props.modalData[
                    studyRegistrationConfig.studyRegistrationAccessCheckField
                  ],
                  props.modalData.project_title,
                  props.modalData.project_number,
                  props.modalData[
                    studyRegistrationConfig.studyRegistrationUIDField
                  ],
                  // get existing data dictionary names
                  Object.keys(
                    props.modalData[
                      studyRegistrationConfig.dataDictionaryField
                    ] || {},
                  ),
                )}
              >
                <React.Fragment>
                  <AuditOutlined />
                  {' Submit a Data Dictionary '}
                </React.Fragment>
              </Button>
            ) : null}
          {props.modalData[
            studyRegistrationConfig.studyRegistrationValidationField
          ]
          && props.user.username
          && !userHasMethodForServiceOnResource(
            'access',
            'study_registration',
            props.modalData[
              studyRegistrationConfig.studyRegistrationAccessCheckField
            ],
            props.userAuthMapping,
          ) ? (
              <Button
                type='text'
                className='discovery-modal__request-button'
                onClick={() => handleRedirectClick(
                  '/data-dictionary-submission/request-access',
                  props.modalData[
                    studyRegistrationConfig.studyRegistrationAccessCheckField
                  ],
                  props.modalData.project_title,
                  props.modalData.project_number,
                  props.modalData[
                    studyRegistrationConfig.studyRegistrationUIDField
                  ],
                )}
              >
                {' '}
                <React.Fragment>
                  <AuditOutlined />
                  {' Request Access to Submit a Data Dictionary '}
                </React.Fragment>
              </Button>
            ) : null}

          {props.modalData[
            studyRegistrationConfig.studyRegistrationValidationField
          ] && !props.user.username ? ( // user is NOT authenticated, Login in to VLMD submission button should be visible only on registered studies
              <Button type='text' onClick={() => handleRedirectToLoginClick()}>
                <React.Fragment>
                  <AuditOutlined />
                  {' Login to Submit a Data Dictionary '}
                </React.Fragment>
              </Button>
            ) : null}
          <Button
            type='text'
            onClick={() => {
              navigator.clipboard
                .writeText(`${hostname}${permalink.replace(/^\/+/g, '')}`)
                .then(() => {
                  props.setPermalinkCopied(true);
                });
            }}
          >
            {props.permalinkCopied ? (
              <React.Fragment>
                <CheckOutlined /> Copied!{' '}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <LinkOutlined /> Permalink{' '}
              </React.Fragment>
            )}
          </Button>
        </Space>
      </div>
      {props.config.detailView?.tabs ? (
        <div className='discovery-modal-content'>
          {header}
          <Tabs
            type={'card'}
            activeKey={tabActiveKey}
            onChange={(activeKey) => {
              setTabActiveKey(activeKey);
            }}
            items={props.config.detailView.tabs.map(
              ({ tabName, groups }, tabIndex) => ({
                label: <span {...tabLabelCls}>{tabName}</span>,
                key: `${tabIndex}`,
                children: (groups || []).map((group, i) => (
                  <div key={i}>
                    {fieldGrouping(
                      props.user,
                      group,
                      props.config,
                      props.modalData,
                    )}
                  </div>
                )),
              }),
            )}
          />
        </div>
      ) : (
        <React.Fragment>
          <div className='discovery-modal-content'>
            {header}
            {props.config.features.authorization.enabled
              && props.modalData[accessibleFieldName]
                !== AccessLevel.NOT_AVAILABLE
              && props.modalData[accessibleFieldName] !== AccessLevel.PENDING
              && (props.modalData[accessibleFieldName]
              === AccessLevel.ACCESSIBLE ? (
                  <Alert
                    className='discovery-modal__access-alert'
                    type='success'
                    message={(
                      <React.Fragment>
                        <UnlockOutlined /> You have access to this data.
                      </React.Fragment>
                    )}
                  />
                ) : (
                  <Alert
                    className='discovery-modal__access-alert'
                    type='warning'
                    message={(
                      <React.Fragment>
                      You do not have access to this data.
                      </React.Fragment>
                    )}
                  />
                ))}
            <div className='discovery-modal-attributes-container'>
              {props.config.studyPageFields.fieldsToShow.map(
                (fieldGroup, i) => {
                  let groupWidth;
                  switch (fieldGroup.groupWidth) {
                  case 'full':
                    groupWidth = 'fullwidth';
                    break;
                  case 'half':
                  default:
                    groupWidth = 'halfwidth';
                    break;
                  }
                  return (
                    <div
                      key={i}
                      className={`discovery-modal__attribute-group discovery-modal__attribute-group--${groupWidth}`}
                    >
                      {fieldGroup.includeName && (
                        <h3 className='discovery-modal__attribute-group-name'>
                          {fieldGroup.groupName}
                        </h3>
                      )}
                      {fieldGroup.fields.map((field) => {
                        const fieldValue = jsonpath.query(
                          props.modalData,
                          `$.${field.field}`,
                        );
                        const isFieldValueEmpty = !fieldValue
                          || fieldValue.length === 0
                          || fieldValue.every((val) => val === '');
                        // display nothing if selected study doesn't have this field
                        // and this field isn't configured to show a default value
                        if (isFieldValueEmpty && !field.includeIfNotAvailable) {
                          return null;
                        }
                        // If the field contains a particularly long string, add some special styles
                        const MULTILINE_FIELD_CHARLIMIT = 200;
                        const multiline = fieldValue[0]
                          && fieldValue[0].length > MULTILINE_FIELD_CHARLIMIT;
                        const renderedFieldContent = (
                          <div
                            key={field.name}
                            className='discovery-modal__attribute'
                          >
                            {field.includeName !== false && (
                              <span className='discovery-modal__attribute-name'>
                                {field.name}
                              </span>
                            )}
                            <span
                              className={`discovery-modal__attribute-value ${
                                multiline
                                  ? 'discovery-modal__attribute-value--multiline'
                                  : ''
                              }`}
                            >
                              {!isFieldValueEmpty
                                ? renderFieldContent(
                                  fieldValue,
                                  field.contentType,
                                  props.config,
                                )
                                : field.valueIfNotAvailable || 'Not available'}
                            </span>
                          </div>
                        );
                        const linkingField = `${field.field}_link`;
                        if (props.modalData[linkingField] !== undefined) {
                          return (
                            <a
                              key={linkingField}
                              href={props.modalData[linkingField]}
                            >
                              {renderedFieldContent}
                            </a>
                          );
                        }
                        return renderedFieldContent;
                      })}
                    </div>
                  );
                },
              )}
            </div>
            {props.config.studyPageFields.downloadLinks
            && props.config.studyPageFields.downloadLinks.field
            && props.modalData[
              props.config.studyPageFields.downloadLinks.field
            ] ? (
                <Collapse
                  className='discovery-modal__download-panel'
                  defaultActiveKey={['1']}
                >
                  <Panel
                    className='discovery-modal__download-panel-header'
                    header={
                      props.config.studyPageFields.downloadLinks.name
                    || 'Data Download Links'
                    }
                    key='1'
                  >
                    <List
                      itemLayout='horizontal'
                      dataSource={
                        props.modalData[
                          props.config.studyPageFields.downloadLinks.field
                        ]
                      }
                      renderItem={(item: ListItem) => (
                        <List.Item
                          actions={[
                            <Button
                              className='discovery-modal__download-button'
                              href={`${fenceDownloadPath}/${item.guid}?expires_in=900&redirect`}
                              target='_blank'
                              type='text'
                              // disable button if data has no GUID
                              disabled={!item.guid}
                              icon={<DownloadOutlined />}
                            >
                            Download File
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={(
                              <div className='discovery-modal__download-list-title'>
                                {item.title}
                              </div>
                            )}
                            description={(
                              <div className='discovery-modal__download-list-description'>
                                {item.description || ''}
                              </div>
                            )}
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>
              ) : null}
          </div>
        </React.Fragment>
      )}
    </Drawer>
  );
};

export default DiscoveryDetails;
