import { createPortal } from "react-dom";

function Tooltip({ text, position }) {
  return createPortal(
    <div
      className="fixed bg-gray-800 text-white text-sm px-2 py-1 rounded z-50"
      style={{ top: position.y, left: position.x }}
    >
      {text}
    </div>,
    document.body
  );
}

export default Tooltip;