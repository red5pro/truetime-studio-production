<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="java.io.File,
			java.util.Arrays,
			java.util.Comparator,
			com.google.gson.*"%>

<%

//Partial or Full path of streams directory here.
File path = new File("webapps/live/streams");

JsonArray ret = new JsonArray();

File [] files = path.listFiles();

//order the files with newest first.
Arrays.sort(files,  new Comparator<File>() {
    public int compare(File f1, File f2) {

    	//To make oldest file first in list, swap f1 and f2 here.
        return Long.compare(f2.lastModified(), f1.lastModified());
    }
});

//Add to json array
for (int i = 0; i < files.length; i++){
    if (files[i].isFile()){ //this line weeds out other directories/folders
    	if(files[i].getName().contains(".flv") || files[i].getName().contains(".mp4") ){
    		ret.add(files[i].getName());
    	}
    }
}

response.getOutputStream().write(ret.toString().getBytes());

%>
