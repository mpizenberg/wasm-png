use std::io::Read;
use wasm_bindgen::prelude::*;
use png_decoder::png::decode_no_check;

#[wasm_bindgen]
pub struct WasmPng {
    file_buffer: Vec<u8>,
}

#[wasm_bindgen]
pub struct ImgSize {
    pub width: usize,
    pub height: usize,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl WasmPng {
    pub fn new() -> WasmPng {
        WasmPng {
            file_buffer: Vec::new(),
        }
    }

    pub fn allocate(&mut self, length: usize) {
        self.file_buffer = vec![0; length];
    }

    pub fn memory_pos(&self) -> *const u8 {
        self.file_buffer.as_ptr()
    }

    pub fn decode_png(&mut self) -> ImgSize {
        let (width, height, _) = read_png_16bits_buf(self.file_buffer.as_slice()).expect("Error");
        ImgSize { width, height }
    }

    pub fn decode_png_me(&mut self) -> ImgSize {
        let png_me = decode_no_check(self.file_buffer.as_slice()).expect("Woops");
        ImgSize { width: png_me.width, height: png_me.height }
    }
}

pub fn read_png_16bits_buf<R: Read>(r: R) -> Result<(usize, usize, Vec<u8>), png::DecodingError> {
    let decoder = png::Decoder::new(r);
    let (info, mut reader) = decoder.read_info()?;
    let mut buffer = vec![0; info.buffer_size()];
    reader.next_frame(&mut buffer)?;
    Ok((info.width as usize, info.height as usize, buffer))
}
