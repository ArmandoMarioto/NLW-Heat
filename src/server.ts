import { serverHttp } from "./app";

serverHttp.listen(4000, () => {
  console.log(`Server is listening on 4000`);
});
