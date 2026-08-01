import DBConnect from "./config/DBConnect";
import createApp from "./app";

DBConnect();

const app = createApp();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}`),
);
