use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn text() -> String {
    String::from("Welcome to the fantastic world of WebAssembly.")
}
