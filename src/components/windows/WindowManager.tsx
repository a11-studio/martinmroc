"use client";

import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import Window from "./Window";
import ProjectWindow from "./ProjectWindow";
import ImageWindow from "./ImageWindow";
import AboutWindow from "./AboutWindow";
import FinderWindow from "./FinderWindow";
import VideoPlayer from "./VideoPlayer";
import MeWindow from "./MeWindow";
import SpotifyPlaylistWindow from "./SpotifyPlaylistWindow";
import GalleryWindow from "./GalleryWindow";

function WindowContent({
  winId,
  type,
  props,
}: {
  winId: string;
  type: string;
  props?: { projectId?: string; src?: string; finderInitialFolder?: "all" | "trash" };
}) {
  switch (type) {
    case "project":
      return <ProjectWindow projectId={props?.projectId} />;
    case "image":
      return <ImageWindow winId={winId} projectId={props?.projectId} src={props?.src} />;
    case "about":
      return <AboutWindow />;
    case "finder":
      return (
        <FinderWindow winId={winId} finderInitialFolder={props?.finderInitialFolder} />
      );
    case "video":
      return <VideoPlayer />;
    case "me":
      return <MeWindow />;
    case "spotify":
      return <SpotifyPlaylistWindow />;
    case "gallery":
      return <GalleryWindow projectId={props?.projectId} />;
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
          <WindowContent winId={win.id} type={win.type} props={win.props} />
        </Window>
      ))}
    </AnimatePresence>
  );
}
