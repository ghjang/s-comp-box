export interface CompProps {
  [key: string]: any;
}

export interface Component {
  componentClass?: any;
  componentClassName?: string;
  customElementName?: string;
  description: string;
  props: CompProps;
  name: string;
}

export interface MenuItem {
  divider?: { style: Record<string, string> };
  link?: {
    text: string;
    url: string;
    target?: string;
  };
  popup?: {
    text: string;
    kind: string;
    title: string;
    content: string;
  };
  subMenu?: {
    text: string;
    items: MenuItem[];
  };
  component?: Component;
  action?: {
    text: string;
    handler: () => Promise<ComponentInfo | null>;
  };
}

export interface ComponentInfo {
  componentClass?: any;
  componentClassName?: string;
  customElementName?: string;
  componentNodeName: string;
  props: CompProps;
}

export interface CustomElement {
  customElementName: string;
  description: string;
  componentClass?: any;
  componentClassName?: string;
  props: CompProps;
}

export interface AvailableContainer {
  component: Component;
}
