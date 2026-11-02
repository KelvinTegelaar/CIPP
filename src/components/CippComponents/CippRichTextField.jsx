// Rich-text editor field, split out of CippFormComponent so the heavy tiptap / prosemirror /
// mui-tiptap dependency tree (~hundreds of KB) is code-split into an async chunk and only
// downloaded on the forms that actually render a `richText` field — instead of being pulled into
// the shared common/_app bundle that every page using CippFormComponent loads. Imported via
// next/dynamic from CippFormComponent. Self-contained: derives `errors` from the passed formControl.
import { Typography } from "@mui/material";
import { Controller, useFormState } from "react-hook-form";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import get from "lodash/get";

export default function CippRichTextField(props) {
  const { convertedName, formControl, validators, label, ...other } = props;
  const { errors } = useFormState({ control: formControl.control });
  const editorInstanceRef = React.useRef(null);
  const lastSetValue = React.useRef(null);

  return (
    <>
      <div>
        <Controller
          name={convertedName}
          control={formControl.control}
          rules={validators}
          render={({ field }) => {
            const { value, onChange, ref } = field;

            // Update content when value changes externally
            React.useEffect(() => {
              if (
                editorInstanceRef.current &&
                typeof value === "string" &&
                value !== lastSetValue.current
              ) {
                editorInstanceRef.current.commands.setContent(value || "", false);
                lastSetValue.current = value;
              }
            }, [value]);

            return (
              <>
                <Typography variant="subtitle2">{label}</Typography>
                <RichTextEditor
                  {...other}
                  immediatelyRender={false}
                  ref={ref}
                  extensions={[StarterKit]}
                  content=""
                  onCreate={({ editor }) => {
                    editorInstanceRef.current = editor;
                    // Set initial content when editor is created
                    if (typeof value === "string") {
                      editor.commands.setContent(value || "", false);
                      lastSetValue.current = value;
                    }
                  }}
                  onUpdate={({ editor }) => {
                    const newValue = editor.getHTML();
                    lastSetValue.current = newValue;
                    onChange(newValue);
                  }}
                  label={label}
                  renderControls={() => (
                    <MenuControlsContainer>
                      <MenuSelectHeading />
                      <MenuDivider />
                      <MenuButtonBold />
                      <MenuButtonItalic />
                    </MenuControlsContainer>
                  )}
                />
              </>
            );
          }}
        />
      </div>
      <Typography variant="subtitle3" color="error">
        {get(errors, convertedName, {}).message}
      </Typography>
    </>
  );
}
