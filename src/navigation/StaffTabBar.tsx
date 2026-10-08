import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { StaffSessionBar } from '@/modules/auth/components/StaffSessionBar';

/** Barra compartida del personal, con identidad y cierre de sesión. */
export function StaffTabBar(props: BottomTabBarProps) {
  return (
    <>
      <StaffSessionBar />
      <BottomTabBar {...props} />
    </>
  );
}
