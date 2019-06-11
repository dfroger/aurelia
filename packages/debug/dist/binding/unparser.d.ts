import * as AST from '@aurelia/runtime';
export declare function enableImprovedExpressionDebugging(): void;
export declare class Unparser implements AST.IVisitor<void> {
    text: string;
    static unparse(expr: AST.IExpression): string;
    visitAccessMember(expr: AST.AccessMember): void;
    visitAccessKeyed(expr: AST.AccessKeyed): void;
    visitAccessThis(expr: AST.AccessThis): void;
    visitAccessScope(expr: AST.AccessScope): void;
    visitArrayLiteral(expr: AST.ArrayLiteral): void;
    visitObjectLiteral(expr: AST.ObjectLiteral): void;
    visitPrimitiveLiteral(expr: AST.PrimitiveLiteral): void;
    visitCallFunction(expr: AST.CallFunction): void;
    visitCallMember(expr: AST.CallMember): void;
    visitCallScope(expr: AST.CallScope): void;
    visitTemplate(expr: AST.Template): void;
    visitTaggedTemplate(expr: AST.TaggedTemplate): void;
    visitUnary(expr: AST.Unary): void;
    visitBinary(expr: AST.Binary): void;
    visitConditional(expr: AST.Conditional): void;
    visitAssign(expr: AST.Assign): void;
    visitValueConverter(expr: AST.ValueConverter): void;
    visitBindingBehavior(expr: AST.BindingBehavior): void;
    visitArrayBindingPattern(expr: AST.ArrayBindingPattern): void;
    visitObjectBindingPattern(expr: AST.ObjectBindingPattern): void;
    visitBindingIdentifier(expr: AST.BindingIdentifier): void;
    visitHtmlLiteral(expr: AST.HtmlLiteral): void;
    visitForOfStatement(expr: AST.ForOfStatement): void;
    visitInterpolation(expr: AST.Interpolation): void;
    private writeArgs;
}
export declare class Serializer implements AST.IVisitor<string> {
    static serialize(expr: AST.IExpression): string;
    visitAccessMember(expr: AST.AccessMember): string;
    visitAccessKeyed(expr: AST.AccessKeyed): string;
    visitAccessThis(expr: AST.AccessThis): string;
    visitAccessScope(expr: AST.AccessScope): string;
    visitArrayLiteral(expr: AST.ArrayLiteral): string;
    visitObjectLiteral(expr: AST.ObjectLiteral): string;
    visitPrimitiveLiteral(expr: AST.PrimitiveLiteral): string;
    visitCallFunction(expr: AST.CallFunction): string;
    visitCallMember(expr: AST.CallMember): string;
    visitCallScope(expr: AST.CallScope): string;
    visitTemplate(expr: AST.Template): string;
    visitTaggedTemplate(expr: AST.TaggedTemplate): string;
    visitUnary(expr: AST.Unary): string;
    visitBinary(expr: AST.Binary): string;
    visitConditional(expr: AST.Conditional): string;
    visitAssign(expr: AST.Assign): string;
    visitValueConverter(expr: AST.ValueConverter): string;
    visitBindingBehavior(expr: AST.BindingBehavior): string;
    visitArrayBindingPattern(expr: AST.ArrayBindingPattern): string;
    visitObjectBindingPattern(expr: AST.ObjectBindingPattern): string;
    visitBindingIdentifier(expr: AST.BindingIdentifier): string;
    visitHtmlLiteral(expr: AST.HtmlLiteral): string;
    visitForOfStatement(expr: AST.ForOfStatement): string;
    visitInterpolation(expr: AST.Interpolation): string;
    private serializeExpressions;
}
//# sourceMappingURL=unparser.d.ts.map