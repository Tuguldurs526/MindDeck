// apps/server/src/types/multer.d.ts

// Minimal declaration so TypeScript stops complaining about "multer".
// We don't need full typings here, "any" is fine for this project.

declare module "multer" {
  const multer: any;
  export default multer;
}
