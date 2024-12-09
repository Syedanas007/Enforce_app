import * as React from 'react';
import { NavigationActions, StackActions, CommonActions  } from '@react-navigation/native';
export const navigationRef = React.createRef();

export function navigateTo(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function navigate(name, params) {
  navigationRef.current?.dispatch(
    CommonActions.navigate({
      name: name,
      params: params,
    })
  );
}
export function navigateAndReset(name, params) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: name, params: params}],
    })
  )
  }

