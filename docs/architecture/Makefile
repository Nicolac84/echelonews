%.png: %.gv
	dot -T png -o $@ $<

%.pdf: %.gv
	dot -T pdf -o $@ $<

all: architecture.png ;

clean:
	-rm *.pdf *.png


.PHONY: all clean
