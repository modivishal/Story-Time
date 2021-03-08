import "./App.css";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const remote = useRef(false);
  const id = useRef();
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "Enter text here: " }],
    },
  ]);
  const [readonly, setreadonly] = useState(true);

  

  useEffect(() => {

    const applyOps = (ops) => {
      remote.current = true;
      JSON.parse(ops).forEach((op) => {
        editor.apply(op);
      });
      remote.current = false;
    }

    socket.on("connect", () => {
      id.current = socket.id;
    });

    socket.on("user-turn", (userTurn) => {
      if (userTurn === id.current) {
        setreadonly(false);
      } else {
        setreadonly(true);
      }
    });

    socket.on("new-remote-ops", ({ editorId, ops }) => {
      if (id.current !== editorId) {
        applyOps(ops);
      }
    });

    socket.on("initial-operations", ({ userId, ops }) => {
      if (id.current === userId) {
        applyOps(ops);
      }
    });

    socket.on("err", (msg) => {
      alert(msg);
    });
  }, [editor]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);

        const ops = editor.operations
          .filter((o) => {
            if (o) {
              return (
                o.type !== "set_selection" &&
                o.type !== "set_value" &&
                (!o.data || !o.data.hasOwnProperty("source"))
              );
            }

            return false;
          })
          .map((o) => ({ ...o, data: { source: "one" } }));

        if (ops.length && !remote.current) {
          socket.emit("new-ops", {
            editorId: id.current,
            ops: JSON.stringify(ops),
          });
        }
      }}
    >
      {!readonly ? <div>It's your turn.</div> : null}
      <Editable readOnly={readonly} />
    </Slate>
  );
};

export default App;
