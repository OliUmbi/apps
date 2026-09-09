# Assets

Short description on how this service should work.

The main purpose is to facilitate blob files that are not stored in the db.
Parts of this API will most likely be directly accessible to the web, to make image access faster
So only management operations should be locked via internal token.
Media is stored on a provided folder and should be structured for efficient lookup.
My proposed file structure will be based on the first 8 uuid chars, each representing a deeper folder structure. (8 is arbitrary so it can be less)
to my knowledge this should make lookup much faster without going too deep. a flat folder structure can become burdensome quite quickly.
this is heavily based on the legacy implementation which worked well (review it as well legacy\api\src\main\java\ch\oliumbi\api\endpoints\shared\image\create\ImageCreate.java)
it should look something like this (example uuid: 415de823-576d-48b0-b9e6-c9fab674ca20))
```
media/
--4/
  --1/
    --5/
      --d/
        --e/
          --8/
            --2/
              --3/
                --415de823-576d-48b0-b9e6-c9fab674ca20/
                  --original.jpg
                  --xs.jpg
                  --sm.jpg
                  --md.jpg
                  --lg.jpg
                  --xl.jpg
```

!!! if there is a better way to structure and access these files please let me know. 

metadata is stored in the db where notably the site, *slug and availablilty is noted.

the management is based for each site where they can access a paginated list of all available images to them
images can be created, deleted, but not updated (for caching purposes, except visibility)
images are converted to different sizes to optimize for aspect rations and general size need
some compression should also be considered especially with large sizes 

for the sizes i would have oriented them to tailwind (measured at width)
xs  20rem (320px) (this one is made up but would be useful for the large management list to reduce bandwidth)
sm	40rem (640px)	
md	48rem (768px)	
lg	64rem (1024px)	
xl	80rem (1280px)	
2xl	96rem (1536px)	

for the file size targets and subsequent compression i would like to get a good recommendation from you.

for documents (mainly pdfs) i just want a clean management and distribution. if possible algin it closely to the image system to keep it simpler. 

for public endpoints:
- get image via id
  - optional arg of size
- get document via slug

for private endpoints
- get image via id
  - even private ones
- get image metadata via id
- get document via id
  - even private ones
- get document metadata via id
- create image metadata (maybe combine together if possible but not necessary, linking can happen later)
- create image
- create document metadata
- create document
- change visibility of image
- change visibility of document
- delete image
- delete document

i might have forgotten some.

