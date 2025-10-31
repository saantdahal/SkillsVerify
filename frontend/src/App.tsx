import { RouterProvider } from "react-router-dom";
import routes from "./routes/route";


function AppContent() {

  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App;
