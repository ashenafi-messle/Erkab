import LoginPage from './login/page';

export default function RootPage() {
  // Render login interface immediately without blocking startup authorization
  return <LoginPage />;
}
