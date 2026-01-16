import axios from "axios";
import { useEffect, useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import "react-quill/dist/quill.snow.css";
import "../free_board/freeBoard.css";

window.Quill = Quill;
Quill.register("modules/ImageResize", ImageResize);

const TextEditor = (props) => {
  const { data, setData, setFreeBoardThumbnail } = props;
  const editorRef = useRef(null);
  const backServer = import.meta.env.VITE_BACK_SERVER;

  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      const form = new FormData();
      form.append("image", file);

      axios
        .post(`${backServer}/freeBoard/image`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          const imageUrl = res.data.startsWith("http")
            ? res.data
            : `${backServer}/freeBoard/editor/${res.data}`;

          console.log("✅ 업로드된 이미지 URL:", imageUrl);

          const editor = editorRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", imageUrl);
          editor.setSelection(range.index + 1);

          setTimeout(() => {
            const imgTag = editor.root.querySelector(`img[src="${imageUrl}"]`);
            if (!imgTag) {
              console.error("❌ 이미지 태그를 찾을 수 없습니다.");
              return;
            }

            console.log("✅ 이미지 태그 발견:", imgTag);

            imgTag.style.maxWidth = "200px";
            imgTag.style.height = "auto";

            const wrapper = document.createElement("span");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "×";
            deleteBtn.style.position = "absolute";
            deleteBtn.style.top = "5px";
            deleteBtn.style.right = "5px";
            deleteBtn.style.background = "rgba(255, 0, 0, 0.7)";
            deleteBtn.style.color = "#fff";
            deleteBtn.style.border = "none";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.fontSize = "18px";
            deleteBtn.style.fontWeight = "bold";
            deleteBtn.style.borderRadius = "50%";
            deleteBtn.style.width = "24px";
            deleteBtn.style.height = "24px";
            deleteBtn.style.opacity = "0";
            deleteBtn.style.transition = "opacity 0.2s";
            deleteBtn.style.zIndex = "10";

            imgTag.parentNode.insertBefore(wrapper, imgTag);
            wrapper.appendChild(imgTag);
            wrapper.appendChild(deleteBtn);

            console.log("✅ 삭제 버튼 생성 완료");

            // 호버 이벤트
            wrapper.onmouseenter = () => {
              console.log("🖱️ 이미지 호버 시작");
              deleteBtn.style.opacity = "1";
            };

            wrapper.onmouseleave = () => {
              console.log("🖱️ 이미지 호버 종료");
              deleteBtn.style.opacity = "0";
            };

            deleteBtn.onmouseenter = () => {
              deleteBtn.style.background = "rgba(255, 0, 0, 0.9)";
              deleteBtn.style.transform = "scale(1.1)";
            };

            deleteBtn.onmouseleave = () => {
              deleteBtn.style.background = "rgba(255, 0, 0, 0.7)";
              deleteBtn.style.transform = "scale(1)";
            };

            deleteBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();

              console.log("🗑️ 삭제 버튼 클릭");

              if (confirm("이미지를 삭제하시겠습니까?")) {
                const filename = imageUrl.split("/").pop();
                console.log("🗑️ 삭제할 파일명:", filename);

                axios
                  .delete(`${backServer}/freeBoard/image/${filename}`)
                  .then((res) => {
                    console.log("✅ 이미지 삭제 성공:", res.data);
                    wrapper.remove();
                  })
                  .catch((err) => {
                    console.error("❌ 이미지 삭제 실패:", err);
                    alert("이미지 삭제에 실패했습니다.");
                  });
              }
            };
          }, 300);

          if (setFreeBoardThumbnail) {
            setFreeBoardThumbnail(imageUrl);
          }
        })
        .catch((err) => {
          console.error("❌ 이미지 업로드 실패", err);
          alert("이미지 업로드에 실패했습니다.");
        });
    };
  };

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ size: ["small", false, "large", "huge"] }, { color: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
            { align: [] },
          ],
          ["image", "link"],
        ],
        handlers: { image: imageHandler },
      },
      ImageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"],
      },
    };
  }, []);

  return (
    <ReactQuill
      ref={editorRef}
      value={data}
      onChange={setData}
      theme="snow"
      modules={modules}
      style={{
        border: "1px solid #2f4e70",
        color: "#fff",
        minHeight: 400,
        borderRadius: 5,
      }}
    />
  );
};

export default TextEditor;
