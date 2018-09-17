import * as ts from 'typescript';
export interface Option {
    pragma?: string;
}
export declare function createTransformer(option?: Option): ts.TransformerFactory<ts.SourceFile>;
export default createTransformer;
