import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
  };
});

// 在 mock 之后再导入
const { ErrorBoundary } = require('@/components/error-boundary');

/** 抛出错误的测试组件 */
function Boom() {
  throw new Error('测试错误');
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('正常渲染子组件', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>正常内容</Text>
      </ErrorBoundary>
    );
    expect(getByText('正常内容')).toBeTruthy();
  });

  it('捕获错误并显示错误界面', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(getByText('出了点问题')).toBeTruthy();
    expect(getByText('测试错误')).toBeTruthy();
  });

  it('点击重新加载按钮重置错误状态', () => {
    let shouldThrow = true;
    function ConditionalBoom() {
      if (shouldThrow) throw new Error('临时错误');
      return <Text>恢复后的内容</Text>;
    }

    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ConditionalBoom />
      </ErrorBoundary>
    );

    // 确认错误界面显示
    expect(getByText('出了点问题')).toBeTruthy();

    // 模拟修复后点击重试
    shouldThrow = false;
    fireEvent.press(getByText('重新加载'));

    // 恢复后应渲染子组件
    expect(queryByText('恢复后的内容')).toBeTruthy();
  });
});
