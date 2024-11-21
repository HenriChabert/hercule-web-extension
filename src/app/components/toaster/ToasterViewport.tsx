import * as ToastPrimitive from "@radix-ui/react-toast";

const ToasterViewport = () => {
  return <ToastPrimitive.Viewport className="fixed bottom-0 left-1/2 -translate-x-1/2 -translate-y-1 w-64" />;
};

export default ToasterViewport;
