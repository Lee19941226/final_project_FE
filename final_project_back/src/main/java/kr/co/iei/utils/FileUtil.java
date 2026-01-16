package kr.co.iei.utils;

import java.io.File;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUtil {
	
	public String fileUpload(String savepath, MultipartFile file) {
	    // ✅ 폴더가 없으면 자동 생성
	    File dir = new File(savepath);
	    if (!dir.exists()) {
	        boolean created = dir.mkdirs();
	        if (created) {
	            System.out.println("생성 성공: " + savepath);
	        } else {
	            System.out.println("폴더 생성 실패: " + savepath);
	        }
	    }
	    
	    String filename = file.getOriginalFilename();
	    String onlyFilename = filename.substring(0, filename.lastIndexOf("."));
	    String extension = filename.substring(filename.lastIndexOf("."));
	    String filepath = null;
	    int count = 0;
	    
	    while(true) {
	        if(count == 0) {
	            filepath = onlyFilename + extension;
	        } else {
	            filepath = onlyFilename + "_" + count + extension;
	        }
	        
	        File checkFile = new File(savepath + filepath);
	        if(!checkFile.exists()) {
	            break;
	        }
	        count++;
	    }
	    
	    try {
	        file.transferTo(new File(savepath + filepath));
	        System.out.println("파일 업로드 성공: " + savepath + filepath);
	    } catch(Exception e) {
	        System.out.println("파일 업로드 실패: " + e.getMessage());
	        e.printStackTrace();
	        return null;
	    }
	    return filepath;
	}
}
