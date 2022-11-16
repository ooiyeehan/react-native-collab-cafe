import * as React from 'react';
import { LogBox } from 'react-native';
import { AuthProvider} from './navigation/AuthProvider';
import Router from './navigation/Router';


export default function App() {
  LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
  LogBox.ignoreAllLogs();//Ignore all log notifications
  return (
    
    <AuthProvider>
      <Router />
    </AuthProvider>

  );
}







    




