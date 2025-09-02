declare module "react-signature-canvas" {
  import React from "react";

  interface SignatureCanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
    penColor?: string;
    backgroundColor?: string;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    onEnd?: () => void;
  }

  class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    getTrimmedCanvas(): HTMLCanvasElement;
    fromDataURL(dataURL: string): void;
  }

  export default SignatureCanvas;
}
