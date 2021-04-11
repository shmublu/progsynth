(set-logic SLIA)

(synth-fun f ((_arg_0 String)) Int
    ((Start Int) (ntString String) (ntInt Int) (ntBool Bool))
    ((Start Int (ntInt))
    (ntString String (_arg_0 " " (str.++ ntString ntString) (str.replace ntString ntString ntString) (str.at ntString ntInt)))
    (ntInt Int (0 1 2 3 4 5 (+ ntInt ntInt) (- ntInt ntInt) (* ntInt ntInt) (str.len ntString) (str.indexof ntString ntString ntInt)))
    (ntBool Bool (true false (str.prefixof ntString ntString) (str.suffixof ntString ntString) (str.contains ntString ntString)))))

(declare-var _arg_0 String)
#PART#

(check-synth)

