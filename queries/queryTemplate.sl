(set-logic SLIA)

(synth-fun f ((_arg_0 String)) String
    ((Start String) (ntString String) (ntInt Int) (ntBool Bool))
    ((Start String (ntString))
    (ntString String (_arg_0 "" " " "<" ">" (str.++ ntString ntString) (str.replace ntString ntString ntString) (str.at ntString ntInt) (str.substr ntString ntInt ntInt)))
    (ntInt Int (1 2 3 4 5 0 (- 1) (+ ntInt ntInt) (- ntInt ntInt) (str.len ntString) (str.indexof ntString ntString ntInt)))
    (ntBool Bool (true false (= ntInt ntInt) (str.prefixof ntString ntString) (str.suffixof ntString ntString) (str.contains ntString ntString)))))
#PART#

(check-synth)
