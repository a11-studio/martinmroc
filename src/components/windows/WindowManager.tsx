"use client";

import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import Window from "./Window";
import ProjectWindow from "./ProjectWindow";
import AboutWindow from "./AboutWindow";
import FinderWindow from "./FinderWindow";
import VideoPlayer from "./VideoPlayer";
import MeWindow from "./MeWindow";

function WindowContent({
  type,
  props,
}: {
  type: string;
  props?: { projectId?: string; src?: string };
}) {
  switch (type) {
    case "project":
      return <ProjectWindow projectId={props?.projectId} />;
    case "about":
      return <AboutWindow />;
    case "finder":
      return <FinderWindow />;
    case "video":
      return <VideoPlayer />;
    case "me":
      return <MeWindow />;
    default:
      return null;
  }
}

export default function WindowManager() {
  const { windows } = useWindowStore();

  return (
    <AnimatePresence>
      {windows.map((win) => (
        <Window key={win.id} window={win}>
          <WindowContent type={win.type} props={win.props} />
        </Window>
      ))}
    </AnimatePresence>
  );
}
