import {  StarOutlined, StarFilled, PlusOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import { Button, message, Input, Space, Image, Row, Col, Popover, Divider, Form, Badge } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import type { ReactText } from 'react';
import { useIntl, FormattedMessage, connect } from 'umi';
import type { Dispatch } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProList from '@ant-design/pro-list';
import type { FormValueType } from './components/UpdateForm';
import { addRule, updateRule, removeRule } from '@/services/ant-design-pro/api';
import type { StateType } from './model';
import styles from './style.less';
import icon_checked from '../../assets/icons8-checked-64.png';
import icon_circle from '../../assets/icons8-circle-50.png';
import type { Task } from './data.d';
import classNames from 'classnames';

const FormItem = Form.Item;



interface TodoListProps {
  todoList: StateType;
  dispatch: Dispatch;
  loading: boolean;
}

/**
 * 添加节点
 *
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 * 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TodoList: React.FC<TodoListProps> = (props) => {
  const {
    loading,
    dispatch,
    todoList: { list },
  } = props;
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: ReactText[]) => setSelectedRowKeys(keys),
  };

  useEffect(() => {
    dispatch({
      type: 'todoList/fetch',
      payload: {
        count: 5,
      },
    });
  }, [1]);

  /** 国际化配置 */
  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.nameLabel"
          defaultMessage="规则名称"
        />
      ),
      dataIndex: 'name',
      tip: '规则名称是唯一的 key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleDesc" defaultMessage="描述" />,
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleCallNo" defaultMessage="服务调用次数" />,
      dataIndex: 'callNo',
      sorter: true,
      hideInForm: true,
      renderText: (val: string) =>
        `${val}${intl.formatMessage({
          id: 'pages.searchTable.tenThousand',
          defaultMessage: ' 万 ',
        })}`,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="状态" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.default" defaultMessage="关闭" />
          ),
          status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="运行中" />
          ),
          status: 'Processing',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="已上线" />
          ),
          status: 'Success',
        },
        3: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.abnormal" defaultMessage="异常" />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.titleUpdatedAt" defaultMessage="上次调度时间" />
      ),
      sorter: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return (
            <Input
              {...rest}
              placeholder={intl.formatMessage({
                id: 'pages.searchTable.exception',
                defaultMessage: '请输入异常原因！',
              })}
            />
          );
        }
        return defaultRender(item);
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.searchTable.config" defaultMessage="配置" />
        </a>,
        <a key="subscribeAlert" href="https://procomponents.ant.design/">
          <FormattedMessage id="pages.searchTable.subscribeAlert" defaultMessage="订阅警报" />
        </a>,
      ],
    },
  ];

  const onFinish = (values: Record<string, any>) => {
    const { dispatch } = props;
    const { todo } = values;
    if(!todo) return;
    console.log('values: ', values);
    const data: Task = {
      id: Math.random().toString(),
      title: todo,
      status: 'InProgress',
      important: false,
    };
    dispatch({
      type: 'todoList/addTodo',
      payload: data,
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    // eslint-disable-next-line no-console
    console.log('Failed:', errorInfo);
  };

  const onKeyUp = (event:any) => {
    if (event.charCode === 13) {
      //form.submit();
    }
  }

  const markTaskImportant = (index: number)  => {
    dispatch({
      type: 'todoList/markItemImportant',
      payload: index
    });
  }

  const markTaskStatus = (index: number)  => {
    dispatch({
      type: 'todoList/markItemStatus',
      payload: index
    });
  }

  // const doneTaskIcon = <Image onMouseMove={handleMouseMove} className={styles.checkbox_checked} width={24} height={24} src={icon_checked} preview={false} />;
  // const inProgessTaskIcon = <Image onMouseMove={handleMouseMove} className={styles.checkbox_circle} width={24} height={24} src={icon_circle} preview={false} />;
  const markAsDoneContent = '标记为已完成';
  const markAsInprogessContent = '标记为未完成';
  const doneTaskIcon = (index: number) => (<Popover content={markAsInprogessContent} trigger="hover"><div onClick={() => markTaskStatus(index)} className={styles.checkbox_checked}></div></Popover>)
  const inProgessTaskIcon = (index: number) => (<Popover content={markAsDoneContent} trigger="hover"><div onClick={() => markTaskStatus(index)} className={styles.checkbox_circle}></div></Popover>)
  const inputContainerClasses = [styles.baseAdd, styles.baseAdd.addTask].join(' ');

  return (
    <PageContainer>
      <Form
          // style={{ marginTop: 8 }}
          form={form}
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <FormItem
            name="todo"
            noStyle
          >
            {/* <Input placeholder={formatMessage({ id: 'formandbasic-form.title.placeholder' })} /> */}
            <Input name="todo" prefix={<PlusOutlined style={{ 'fontSize': '1.2rem', 'color': 'grey', 'margin': '0 14px'}} />} className={styles.input_borderless} placeholder="添加任务" bordered={false} />
          </FormItem>
          </Form>
      {/* <Input prefix={<PlusOutlined style={{ 'fontSize': '1.2rem', 'color': 'grey', 'margin': '0 14px'}} />} className={styles.input_borderless} placeholder="添加任务" bordered={false} /> */}
      <ProList<Task>
        // onRow={(record: any) => {
        //   return {
        //     onMouseEnter: () => {
        //       console.log(record);
        //     },
        //     onClick: () => {
        //       console.log(record);
        //     },
        //   };
        // }}

        toolBarRender={false}
        loading={loading}
        dataSource={list}
        split={true}
        metas={{
          title: {
            dataIndex: 'title',
            render: (_, record: Task) => (
              record.status === 'InProgress' ?  <span>{record.title}</span> : <span style={{textDecoration:'line-through'}}>{record.title}</span>
            )
          },
          avatar: {
            render: (text: React.ReactNode,record: Task, index: number) => (
              record.status === 'Done' ? 
              doneTaskIcon(index)
              : 
              inProgessTaskIcon(index)
            )
          },
          description: {
            dataIndex: 'status',
            render: (_, record: Task) => (
              record.status === 'InProgress' ?  <Badge color='blue' status="processing" text={intl.formatMessage({ id: 'pages.todo.list.status.inProgress' })} /> : <Badge color='green' text={intl.formatMessage({ id: 'pages.todo.list.status.done' })} />
            )
          },
          actions: {
            render: (_, task: Task, index: number) => {
              return <a key="star" onClick={() => markTaskImportant(index)} style={{'float': 'right'}}>{task.important ? <StarFilled  /> : <StarOutlined />}</a>
            },
          },
        }}
      />
    </PageContainer>
  );
};

export default connect(
  ({
    todoList,
    loading,
  }: {
    todoList: StateType;
    loading: {
      models: Record<string, boolean>;
    };
  }) => ({
    todoList,
    loading: loading.models.todoList,
  }),
)(TodoList);
