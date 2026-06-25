import { RemoteControl } from "./components/RemoteControl";
import { SlideDeck } from "./components/SlideDeck";
import { slides } from "./slides";

const query = new URLSearchParams(window.location.search);
const role = query.get("role") || "screen";

export default function App() {
  if (role === "remote") {
    return <RemoteControl totalSlides={slides.length} />;
  }

  return <SlideDeck slides={slides} />;
}
