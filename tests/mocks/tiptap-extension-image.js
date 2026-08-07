import { Node } from "@tiptap/core";

// mui-tiptap requires peer @tiptap/extension-image, package.json omits it.
// webpack tree-shakes the only module using it (ResizableImage), vite's prebundler doesn't, stub it
export const Image = Node.create({ name: "image" });
export default Image;
