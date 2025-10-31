import { RouterProvider } from "react-router-dom";
import routes from "./routes/route";
// import { ChatProvider, ChatContext } from "./context/ChatContext";

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
