import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

export default function Chat() {
  const [messages, setMessages] = useState([]);

  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  useEffect(() => {
    firestore()
      .collection("users")
      .doc(quizGroupName)
      .onSnapshot((documentSnapshot) => {
        // console.log('User exists: ', documentSnapshot.exists);

        if (documentSnapshot?.exists) {
          let returnedMessages =
            documentSnapshot.data()[quizGroupNameRaw].chats;
          // let parsedMessages = returnedMessages.map(item=>{
          //     return  JSON.parse(item)
          // })
          setMessages(
            returnedMessages
              ? returnedMessages.map((doc) => ({
                  _id: doc._id,
                  createdAt: doc.createdAt.toDate(),
                  text: doc.text,
                  user: doc.user,
                }))
              : []
          );
        }
      });
  }, []);

  const onSend = useCallback(async (message) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, message)
    );

    await firestore()
      .collection("users")
      .doc(quizGroupName)
      .update({
        [`${quizGroupNameRaw}.chats`]: firestore.FieldValue.arrayUnion(message),
      })

      .catch((e) => console.log(e.message));
  }, []);

  return (
    <GiftedChat
      messages={messages.sort((x, y) => {
        (x = new Date(x.createdAt)), (y = new Date(y.createdAt));
        return x - y;
      })}
      onSend={(message) =>
        onSend({
          ...message[0],
          createdAt: new Date(),
          username: dbUser.firstName + "(" + currentGroupCadre + ")",
        })
      }
      loadEarlier={true}
      renderUsernameOnMessage={true}
      inverted={false}
      user={{
        _id: dbUser.email,
        groupName: quizGroupName,
        name: dbUser.firstName + "(" + currentGroupCadre + ")",
      }}
    />
  );
}
