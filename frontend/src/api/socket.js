import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});
 

import { useEffect } from "react";
import { useSelector } from "react-redux";

export function useSocketPresence() {
  const buyerUser = useSelector((state) => state.user.currentUser?.data);
  const sellerUser = useSelector((state) => state.seller?.currentSeller?.data);
  const currentUserId = buyerUser?._id || sellerUser?._id;

  useEffect(() => {
    if (!currentUserId) {
      socket.disconnect();
      return;
    }

    socket.connect();
    socket.emit("addUser", currentUserId);

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);
}