import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SubtitlesOutlinedIcon from "@mui/icons-material/SubtitlesOutlined";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useRecoilState } from "recoil";
import { loginIdState, memberNoState } from "../utils/RecoilData";
import TextEditor from "../utils/TextEditor";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FreeBoardWrite = ({ menus }) => {
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const navigate = useNavigate();
  const [memberId] = useRecoilState(loginIdState);
  const [memberNo] = useRecoilState(memberNoState);
  const [memberNickname, setMemberNickname] = useState("");
  const [freeBoardTitle, setFreeBoardTitle] = useState("");
  const [freeBoardContent, setFreeBoardContent] = useState("");
  const [cate, setCate] = useState("");
  const [subCate, setSubCate] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [freeBoardCategoryNo, setFreeBoardCategoryNo] = useState();
  const [freeBoardSubcategoryNo, setFreeBoardSubcategoryNo] = useState();
  const [freeBoardThumbnail, setFreeBoardThumbnail] = useState(null);

  useEffect(() => {
    axios
      .get(`${backServer}/member/${memberId}`)
      .then((res) => {
        setMemberNickname(res.data.memberNickname);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [memberId]);

  useEffect(() => {
    if (!cate) return;

    axios
      .get(`${backServer}/freeBoard/boardWrite`, {
        params: { freeBoardCategory: cate },
      })
      .then((res) => {
        setSubCate(res.data);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [cate]);

  const handleChange = (e) => {
    setCate(e.target.value);
    setSelectedSub("");
    setFreeBoardCategoryNo(undefined);
    setFreeBoardSubcategoryNo(undefined);
  };

  const subHandleChange = (e) => {
    const selected = subCate.find(
      (sub) => sub.freeBoardSubcategory === e.target.value
    );
    setSelectedSub(e.target.value);

    if (selected) {
      setFreeBoardCategoryNo(selected.freeBoardCategoryNo);
      setFreeBoardSubcategoryNo(selected.freeBoardSubcategoryNo);
    }
  };

  const writeFreeBoard = () => {
    if (!freeBoardCategoryNo || !freeBoardSubcategoryNo) {
      Swal.fire({
        title: "카테고리",
        text: "카테고리를 선택해주세요.",
        icon: "warning",
      });
      return;
    }
    if (!freeBoardTitle.trim()) {
      Swal.fire({
        title: "제목 입력",
        text: "제목을 입력해주세요.",
        icon: "warning",
      });
      return;
    }
    if (!freeBoardContent.trim()) {
      Swal.fire({
        title: "내용 입력",
        text: "내용을 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("freeBoardCategoryNo", freeBoardCategoryNo);
    formData.append("freeBoardSubcategoryNo", freeBoardSubcategoryNo);
    formData.append("freeBoardTitle", freeBoardTitle);
    formData.append("memberNo", memberNo);
    formData.append("freeBoardContent", freeBoardContent);

    if (freeBoardThumbnail) {
      formData.append("freeBoardThumbnail", freeBoardThumbnail);
    }

    axios
      .post(`${backServer}/freeBoard/boardWrite`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data === 1) {
          Swal.fire({
            title: "작성 완료",
            text: "게시글이 등록되었습니다.",
            icon: "success",
          }).then(() => {
            navigate("/freeBoard/content");
          });
        }
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  };

  const cancelWrite = () => {
    Swal.fire({
      title: "취소",
      text: "작성을 취소하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then((confirm) => {
      if (confirm.isConfirmed) {
        navigate("/freeBoard/content");
      }
    });
  };

  return (
    <div className="write-wrap">
      <div className="write-header">
        <h2>✍️ 게시글 작성</h2>
        <p className="write-subtitle">자유롭게 의견을 나눠보세요!</p>
      </div>

      <div className="write-form">
        {/* 작성자 정보 */}
        <div className="form-row">
          <label className="form-label">
            <DriveFileRenameOutlineOutlinedIcon className="label-icon" />
            작성자
          </label>
          <div className="form-value">
            <span className="author-name">{memberNickname}</span>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div className="form-row">
          <label className="form-label">
            <CategoryOutlinedIcon className="label-icon" />
            카테고리
          </label>
          <div className="form-input category-select-group">
            <FormControl className="category-select">
              <Select
                value={cate}
                onChange={handleChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <span className="placeholder">Category</span>;
                  }
                  return selected;
                }}
              >
                {menus.map((menu, i) => (
                  <MenuItem key={`menu-${i}`} value={menu.freeBoardCategory}>
                    {menu.freeBoardCategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {cate && (
              <FormControl className="category-select">
                <Select
                  value={selectedSub}
                  onChange={subHandleChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span className="placeholder">Sub Category</span>;
                    }
                    return selected;
                  }}
                >
                  {subCate.map((sub, i) => (
                    <MenuItem key={`sub-${i}`} value={sub.freeBoardSubcategory}>
                      {sub.freeBoardSubcategory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </div>

        {/* 제목 */}
        <div className="form-row">
          <label className="form-label">
            <SubtitlesOutlinedIcon className="label-icon" />
            제목
          </label>
          <div className="form-input">
            <input
              type="text"
              className="title-input"
              value={freeBoardTitle}
              placeholder="제목을 입력하세요"
              onChange={(e) => setFreeBoardTitle(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        {/* 내용 */}
        <div className="form-row editor-row">
          <label className="form-label">
            <ContentPasteOutlinedIcon className="label-icon" />
            내용
          </label>
          <div className="form-input editor-wrapper">
            <TextEditor
              setData={setFreeBoardContent}
              data={freeBoardContent}
              setFreeBoardThumbnail={setFreeBoardThumbnail}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="form-actions">
          <button className="btn-cancel" onClick={cancelWrite}>
            취소
          </button>
          <button className="btn-submit" onClick={writeFreeBoard}>
            작성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeBoardWrite;
