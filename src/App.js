import './App.css';
import React, { useEffect, useMemo, useState, useRef  } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const remote = useRef(false);
  const id = useRef(`${Date.now()}`);
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'Enter Something here' }],
    },
  ])

  useEffect(() => {
    socket.on(
      "new-remote-operations",
      ({editorId, ops}) => {
        if (id.current !== editorId) {
          console.log(ops);
          remote.current = true;
          JSON.parse(ops).forEach((op) =>{
            editor.apply(op);
           }
         );
         remote.current = false;
        }
      }
    );
  }, [editor]);
  

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);

        const ops = editor.operations
        .filter(o => {
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
          socket.emit("new-operations", {
            editorId: id.current,
            ops: JSON.stringify(ops)
          });
        }
      }}
    >
      <Editable />
    </Slate>
  )
};

export default App;
