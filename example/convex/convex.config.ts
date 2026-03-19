import { defineApp } from "convex/server";
import bunny from "convex-bunny/convex.config";

const app = defineApp();
app.use(bunny);

export default app;
