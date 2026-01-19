package kr.co.iei.freeboard.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.co.iei.admin.model.service.AdminService;
import kr.co.iei.freeboard.model.dto.FreeBoardCategoryDTO;
import kr.co.iei.freeboard.model.dto.FreeBoardCommentDTO;
import kr.co.iei.freeboard.model.dto.FreeBoardCommentLikeDTO;
import kr.co.iei.freeboard.model.dto.FreeBoardDTO;
import kr.co.iei.freeboard.model.dto.FreeBoardLikeDTO;
import kr.co.iei.freeboard.model.dto.FreeBoardPhotoDTO;
import kr.co.iei.freeboard.model.dto.FreeBoardViewDTO;
import kr.co.iei.freeboard.model.service.FreeBoardService;
import kr.co.iei.tradeBoard.model.service.TradeBoardService;
import kr.co.iei.utils.FileUtil;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "/freeBoard")
public class FreeBoardController {

    private final TradeBoardService tradeBoardService;
	
	
	@Autowired
	private FreeBoardService freeBoardService;
	
	@Autowired
	private FileUtil fileUtil;
	
	@Value("${file.root}")
	private String root;


    FreeBoardController(TradeBoardService tradeBoardService) {
        this.tradeBoardService = tradeBoardService;
    }

	
	@GetMapping(value = "/mainPage")
	public ResponseEntity<List<Map<String, Object>>> categoryList(){
		 List<Map<String, Object>> cate = freeBoardService.selectCategoryList();
		
		return ResponseEntity.ok(cate);
	}
	@GetMapping(value = "/content/freeBoardTitle")
	public ResponseEntity<HashMap<String, Object>> searchTitle(@RequestParam int pageNo, @RequestParam int listCnt, @RequestParam int sideBtnCount, @RequestParam int order, @RequestParam String freeBoardTitle){
		int startRow = (pageNo-1)*listCnt+1;
		int endRow = pageNo * listCnt;
		
		HashMap<String, Object> map = freeBoardService.searchTitle(startRow, endRow ,sideBtnCount , order, freeBoardTitle);
		System.out.println(map);
		return ResponseEntity.ok(map);
	}
	@GetMapping(value = "/content")
	public ResponseEntity<HashMap<String, Object>> boardList(@RequestParam int pageNo, @RequestParam int listCnt, @RequestParam int sideBtnCount, @RequestParam int order){
		//freeBoardList : 게시글 담을 객체
		//totalListCount : 게시글 수
		//pageNo: 한 페이지에 나타낼 수 있는 버튼 수
		//listCnt : 한 페이지에 넣을 게시글 수
		//sidebtnCount : 한 페이지에서 나타내는 버튼 수중에 가운데 버튼을 기준으로 양 옆에 나타내고싶은 버튼 수
		//order: (2 : 최신순, 1 : 오래된순) default 값 = 2
		int startRow = (pageNo-1)*listCnt+1;
		int endRow = pageNo * listCnt;
		//리스트랑 토탈 리스트 카운트 받아야 함
		
		HashMap<String, Object> map = freeBoardService.boardList(startRow, endRow ,sideBtnCount , order);
		
		//System.out.println(map);
		return ResponseEntity.ok(map);
	}
	@GetMapping(value = "/content/category")
	public ResponseEntity<HashMap<String, Object>> boardSubList(@RequestParam int pageNo, @RequestParam int listCnt, @RequestParam int sideBtnCount, @RequestParam int order, @RequestParam int selected){
		
		int startRow = (pageNo-1)*listCnt+1;
		int endRow = pageNo * listCnt;
		
		HashMap<String, Object> map = freeBoardService.boardSubList(startRow, endRow ,sideBtnCount , order, selected);
		
		return ResponseEntity.ok(map);
	}
	
	//정민 작업
	@GetMapping(value="/mainTitle")
	public ResponseEntity<List<FreeBoardDTO>> mainTitle(@RequestParam(defaultValue = "10") int limit){
		List<FreeBoardDTO> list = freeBoardService.mainTitle(limit);
		return ResponseEntity.ok(list);
	}
	
	@GetMapping(value= "/boardWrite")
	public ResponseEntity<List> isSubCategory(@RequestParam String freeBoardCategory){

		List subList = freeBoardService.isSubCategory(freeBoardCategory);

		return ResponseEntity.ok(subList);
	}
	
	@GetMapping(value="/mainCategory")
	public ResponseEntity<List<FreeBoardDTO>> mainCategory(@RequestParam int freeBoardCategoryNo){
		List<FreeBoardDTO> list = freeBoardService.mainCategory(freeBoardCategoryNo);
		System.out.println("컨트롤러 : " + list);
		return ResponseEntity.ok(list);
	}
	@PostMapping(value = "/image")
	public ResponseEntity<String> editorImage(@ModelAttribute MultipartFile image){
		String savepath = root + "/freeBoard/editor/";
	    
	    // ✅ 폴더 자동 생성
	    File dir = new File(savepath);
	    if (!dir.exists()) {
	        dir.mkdirs();
	        System.out.println("에디터 이미지 폴더 생성: " + savepath);
	    }
	    
	    String filepath = fileUtil.fileUpload(savepath, image);
	    System.out.println("에디터 이미지 업로드: " + filepath);
	    
	    return ResponseEntity.ok(filepath);
	}
	@GetMapping(value = "/detail/freeBoardcate")
	public ResponseEntity<FreeBoardCategoryDTO> oneCate(@RequestParam int freeBoardNo){
		FreeBoardCategoryDTO freeBoardCate = freeBoardService.oneCate(freeBoardNo);
		System.out.println("freeBoard : " + freeBoardCate);
		return ResponseEntity.ok(freeBoardCate);
	}
	
	//TextEditor에서 이미지 삭제
	@DeleteMapping("/image/{filename}")
	public ResponseEntity<String> deleteEditorImage(@PathVariable String filename) {
	    try {
	        // URL 인코딩되어 들어오는 경우를 대비해 디코딩
	        String decodedFilename = java.net.URLDecoder.decode(filename, java.nio.charset.StandardCharsets.UTF_8);
	        
	        // 저장 경로
	        String savePath = root + "/freeBoard/editor/";
	        File targetFile = new File(savePath + decodedFilename);
	        
	        if (!targetFile.exists()) {
	            return ResponseEntity.status(404).body("파일이 존재하지 않습니다: " + decodedFilename);
	        }

	        // 삭제 시도
	        boolean deleted = targetFile.delete();
	        if (deleted) {
	            return ResponseEntity.ok("이미지 삭제 성공: " + decodedFilename);
	        } else {
	            return ResponseEntity.status(500).body("이미지 삭제 실패: " + decodedFilename);
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("서버 오류: " + e.getMessage());
	    }
	}
	
	//TextEditor 이미지 입력 후 delete
	@PatchMapping(value = "/image/{freeBoardNo}")
	public ResponseEntity<Integer> deleteImg(@PathVariable int freeBoardNo){
		System.out.println("yeah" + freeBoardNo);
		int result = freeBoardService.deleteImg(freeBoardNo);
		return ResponseEntity.ok(result);
	}
	
	@PostMapping(value = "/boardWrite")
	public ResponseEntity<Integer> insertFreeBoard(
	    @ModelAttribute FreeBoardDTO freeBoard, 
	    @ModelAttribute MultipartFile freeBoardThumbnail, 
	    @ModelAttribute MultipartFile[] freeBoardPhoto
	) {
	    // 썸네일 업로드
	    if(freeBoardThumbnail != null && !freeBoardThumbnail.isEmpty()) {
	        String savepath = root + "/freeBoard/thumbnail/";
	        
	        // ✅ 폴더 자동 생성
	        File dir = new File(savepath);
	        if (!dir.exists()) {
	            dir.mkdirs();
	            System.out.println("✅ 썸네일 폴더 생성: " + savepath);
	        }
	        
	        String filepath = fileUtil.fileUpload(savepath, freeBoardThumbnail);
	        freeBoard.setFreeBoardThumbnail(filepath);
	        System.out.println("✅ 썸네일 업로드: " + filepath);
	    }
	    
	    // 첨부 이미지 업로드 (필요시)
	    if(freeBoardPhoto != null && freeBoardPhoto.length > 0) {
	        String savepath = root + "/freeBoard/image/";
	        
	        // ✅ 폴더 자동 생성
	        File dir = new File(savepath);
	        if (!dir.exists()) {
	            dir.mkdirs();
	            System.out.println("✅ 첨부파일 폴더 생성: " + savepath);
	        }
	        
	        List<FreeBoardPhotoDTO> freeBoardPhotoList = new ArrayList<>();
	        for(MultipartFile file : freeBoardPhoto) {
	            if(!file.isEmpty()) {
	                String filename = fileUtil.fileUpload(savepath, file);
	                FreeBoardPhotoDTO photoDTO = new FreeBoardPhotoDTO();
	                photoDTO.setFBPhotoname(filename);
	                photoDTO.setFBPhotopath(file.getOriginalFilename());
	                freeBoardPhotoList.add(photoDTO);
	                System.out.println("✅ 첨부파일 업로드: " + filename);
	            }
	        }
	        // freeBoardPhotoList를 freeBoard에 설정하는 로직 추가
	    }
	    
	    int result = freeBoardService.insertFreeBoard(freeBoard);
	    return ResponseEntity.ok(result);
	}

	@GetMapping(value = "/detail/{freeBoardNo}")
	public ResponseEntity<FreeBoardDTO> selectOneDetail(@PathVariable int freeBoardNo){
		FreeBoardDTO freeBoard = freeBoardService.selectOneDetail(freeBoardNo);
		
		return ResponseEntity.ok(freeBoard);
	}
	@GetMapping(value = "/detail/comment")
	public ResponseEntity<HashMap<String, Object>> selectCommentList(@RequestParam int freeBoardNo, @RequestParam int pageNo, @RequestParam int listCnt, @RequestParam int sideBtnCount, @RequestParam int order){
		int startRow = (pageNo-1)*listCnt+1;
		int endRow = pageNo * listCnt;
		
		HashMap<String, Object> map = freeBoardService.selectCommentList(freeBoardNo, startRow, endRow ,sideBtnCount , order);
		//System.out.println(freeBoardComment);
		return ResponseEntity.ok(map);
	}

	@PostMapping(value = "/detail/regist")
	public ResponseEntity<Integer> insertComment(@RequestBody FreeBoardCommentDTO comment){
		//System.out.println(comment);
		int result = freeBoardService.insertComment(comment);
		return ResponseEntity.ok(result);
	}
	
	@GetMapping(value = "/modify")//수정할 게시글 정보 가져옴
	public ResponseEntity<FreeBoardDTO> selectOneBoard(@RequestParam int freeBoardNo){
		
		FreeBoardDTO freeBoard = freeBoardService.selectOneBoard(freeBoardNo);
		return ResponseEntity.ok(freeBoard);
	}
	
	@GetMapping(value = "/modify/cate")
	public ResponseEntity<FreeBoardCategoryDTO> selectCategory(@RequestParam int freeBoardSubcategoryNo, @RequestParam int freeBoardCategoryNo){
		FreeBoardCategoryDTO cate = freeBoardService.selectCategory(freeBoardSubcategoryNo, freeBoardCategoryNo);
		return ResponseEntity.ok(cate);
	}
	
	@DeleteMapping(value = "/detail/delete/{freeBoardNo}")
	public ResponseEntity<Integer> deleteFreeBoard(@PathVariable int freeBoardNo) {
		int result = freeBoardService.deleteFreeBoard(freeBoardNo);
		return ResponseEntity.ok(result);
	}
	
	@PostMapping(value = "/{freeBoardNo}/claim")
	public ResponseEntity<Integer> insertClaim(@PathVariable int freeBoardNo,@RequestBody HashMap<String, Object> fbClaimSet){
		System.out.println(fbClaimSet);
		
		int result = freeBoardService.insertClaim(fbClaimSet);
		System.out.println("최종 결과값 확인 : "+result);
		return ResponseEntity.ok(result);
	}
	
	@PostMapping(value = "/comment/{fbCommentNo}/claim")
	public ResponseEntity<Integer> insertCommentClaim(@PathVariable int fbCommentNo,@RequestBody HashMap<String, Object> fbcClaimSet){
		System.out.println(fbcClaimSet);
		
		int result = freeBoardService.insertCommentClaim(fbcClaimSet);
		System.out.println("최종 결과값 확인 : "+result);
		return ResponseEntity.ok(result);
	}
	@GetMapping(value = "/modify/select")
	public ResponseEntity<FreeBoardCategoryDTO> selectCateNo(@RequestParam String freeBoardCategory, @RequestParam String freeBoardSubcategory){
		FreeBoardCategoryDTO freeBoardCate = freeBoardService.selectCateNo(freeBoardCategory, freeBoardSubcategory); 
		return ResponseEntity.ok(freeBoardCate);
	}
	@GetMapping(value = "/modify/thumb")
	public ResponseEntity<FreeBoardDTO> selectThumb(@RequestParam int freeBoardNo){
		FreeBoardDTO freeThumb = freeBoardService.selectThumb(freeBoardNo);
		return ResponseEntity.ok(freeThumb);
	}
	@PatchMapping(value = "/modify/fix")
	public ResponseEntity<Integer> modifyFreeBoard(@ModelAttribute FreeBoardDTO freeBoard, @ModelAttribute MultipartFile freeBoardThumbnail, @ModelAttribute MultipartFile[] freeBoardPhoto) {
		if(freeBoardThumbnail != null) {
			String savepath = root + "/freeBoard/thumbnail/";
			String filepath = fileUtil.fileUpload(savepath, freeBoardThumbnail);
			freeBoard.setFreeBoardThumbnail(filepath);
		}
		int result = freeBoardService.modifyFreeBoard(freeBoard);
		/*
		List<FreeBoardPhotoDTO> freeBoardPhotoList = new ArrayList<FreeBoardPhotoDTO>();
		if(freeBoardPhoto != null) {
			String savepath = root+ "/freeBoard/image/";
			for(MultipartFile file : freeBoardPhoto) {
				String FBPhotopath = file.getOriginalFilename();
				String FBPhotoname = fileUtil.fileUpload(savepath, file);
				FreeBoardPhotoDTO fileDTO = new FreeBoardPhotoDTO();
				fileDTO.setFBPhotoname(FBPhotoname);
				fileDTO.setFBPhotopath(FBPhotopath);
				
				freeBoardPhotoList.add(fileDTO);
				System.out.println(freeBoardPhotoList);
			}
		}*/
		//FreeBoardDTO board = freeBoardService.modifyFreeBoard(freeBoard);
		//int result = freeBoardService.modifyFreeBoard(freeBoard);
		return ResponseEntity.ok(result);
	}
	@PatchMapping(value = "/detail/update")
	public ResponseEntity<Integer> updateComment(@RequestBody FreeBoardCommentDTO freeBoardComment){
		int result = freeBoardService.updateComment(freeBoardComment);
		return ResponseEntity.ok(result);
	}
	@DeleteMapping(value = "/detail/deleteComment/{fbCommentNo}")
	public ResponseEntity<Integer> deleteComment(@PathVariable int fbCommentNo){
		int result = freeBoardService.deleteComment(fbCommentNo);
		return ResponseEntity.ok(result);
	}
	/* 좋아요 */
	@GetMapping(value = "/detail/selectLike")
	public ResponseEntity<FreeBoardLikeDTO> countLike(@RequestParam int memberNo, @RequestParam int freeBoardNo, @RequestParam int freeBoardSubcategoryNo, @RequestParam int freeBoardCategoryNo){
		FreeBoardLikeDTO freeBoardLike = freeBoardService.countLike(memberNo, freeBoardNo, freeBoardSubcategoryNo, freeBoardCategoryNo);
		//System.out.println(freeBoardLike);
		return ResponseEntity.ok(freeBoardLike);
	}
	/* 뷰(view) */
	@GetMapping(value = "/content/view")
	public ResponseEntity<FreeBoardViewDTO> countView(@RequestParam(required = false) int memberNo, @RequestParam int freeBoardNo, @RequestParam int freeBoardCategoryNo, @RequestParam int freeBoardSubcategoryNo){
		FreeBoardViewDTO freeBoardView = freeBoardService.countView(memberNo, freeBoardNo, freeBoardCategoryNo, freeBoardSubcategoryNo);
		System.out.println(memberNo);
		System.out.println(freeBoardView);
		return ResponseEntity.ok(freeBoardView);		
	}
	@GetMapping(value="/detail/commentLike")
	public ResponseEntity<FreeBoardCommentLikeDTO> commentLike(@RequestParam int memberNo, @RequestParam int fbCommentNo){
		FreeBoardCommentLikeDTO freeBoardCommentLike = freeBoardService.commentLike(memberNo, fbCommentNo);
		
		return ResponseEntity.ok(freeBoardCommentLike);
	}
	
	@GetMapping(value="/detail/{freeBoardNo}/recommends")
	public ResponseEntity<List<FreeBoardDTO>> recommends(@PathVariable int freeBoardNo){
		System.out.println("회원 번호"+freeBoardNo);
		List<FreeBoardDTO> recommends = freeBoardService.recommends(freeBoardNo);
		System.out.println("ㅇㅇㅇㅇㅇ" + recommends);
		return ResponseEntity.ok(recommends);
	}
	
	@GetMapping(value="/detail/{freeBoardCategoryNo}/{freeBoardSubcategoryNo}/{freeBoardNo}")
	public ResponseEntity<FreeBoardDTO> prevFreeBoardNo(@PathVariable int freeBoardCategoryNo, @PathVariable int freeBoardSubcategoryNo,@PathVariable int freeBoardNo){
		System.out.println(freeBoardCategoryNo);
		System.out.println(freeBoardSubcategoryNo);
		System.out.println(freeBoardNo);
		HashMap<String, Object> currFreeBoard = new HashMap<>();
		currFreeBoard.put("freeBoardCategoryNo", freeBoardCategoryNo);
		currFreeBoard.put("freeBoardSubcategoryNo", freeBoardSubcategoryNo);
		currFreeBoard.put("freeBoardNo", freeBoardNo);
		FreeBoardDTO prevFreeBoard = freeBoardService.prevFreeBoard(currFreeBoard);
		System.out.println(prevFreeBoard);
		return ResponseEntity.ok(prevFreeBoard);
		
	}
	
	@GetMapping(value="/detail/next/{freeBoardCategoryNo}/{freeBoardSubcategoryNo}/{freeBoardNo}")
	public ResponseEntity<FreeBoardDTO> nextFreeBoardNo(@PathVariable int freeBoardCategoryNo, @PathVariable int freeBoardSubcategoryNo,@PathVariable int freeBoardNo){
		System.out.println(freeBoardCategoryNo);
		System.out.println(freeBoardSubcategoryNo);
		System.out.println(freeBoardNo);
		HashMap<String, Object> currFreeBoard = new HashMap<>();
		currFreeBoard.put("freeBoardCategoryNo", freeBoardCategoryNo);
		currFreeBoard.put("freeBoardSubcategoryNo", freeBoardSubcategoryNo);
		currFreeBoard.put("freeBoardNo", freeBoardNo);
		FreeBoardDTO nextFreeBoard = freeBoardService.nextFreeBoard(currFreeBoard);
		System.out.println(nextFreeBoard);
		return ResponseEntity.ok(nextFreeBoard);
		
	}
	
	@GetMapping(value="/isLike/{memberNo}/{freeBoardNo}")
	public ResponseEntity<String> isLike(@PathVariable int memberNo, @PathVariable int freeBoardNo){
		System.out.println(memberNo);
		System.out.println(freeBoardNo);
		String result = freeBoardService.isLike(memberNo,freeBoardNo);
		System.out.println("dddddddddddd");
		System.out.println(result);
		
		return ResponseEntity.ok(result);
	}
	
	
}
