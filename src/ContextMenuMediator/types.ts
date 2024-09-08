export interface MenuItem {
  divider?: boolean;
  link?: { text: string };
  popup?: { text: string };
  action?: { text: string; checked?: boolean };
  subMenu?: { text: string; items: MenuItem[] };
}

export interface MenuPosition {
  x: number;
  y: number;
}

export interface MenuSize {
  width: number;
  height: number;
}
