/*
this needs the mpc23s17 thingy as well
*/

#include <stdio.h>
#include <unistd.h>
#include "mcp23s17.h"


int main(int argc, char **argv)
{
    const int bus = 0;
    const int chip_select = 0;
    const int hw_addr = 0;
    int leds = 0x00;

    if (argc > 1){
    	leds = atoi(argv[1]);
    }

    int mcp23s17_fd = mcp23s17_open(bus, chip_select);

    // config register
    const uint8_t ioconfig = BANK_OFF | \
                             INT_MIRROR_OFF | \
                             SEQOP_OFF | \
                             DISSLW_OFF | \
                             HAEN_ON | \
                             ODR_OFF | \
                             INTPOL_LOW;
    mcp23s17_write_reg(ioconfig, IOCON, hw_addr, mcp23s17_fd);

    // I/O direction
    mcp23s17_write_reg(0x00, IODIRA, hw_addr, mcp23s17_fd);
    mcp23s17_write_reg(0xff, IODIRB, hw_addr, mcp23s17_fd);

    // GPIOB pull ups
    mcp23s17_write_reg(0xff, GPPUB, hw_addr, mcp23s17_fd);

    // Write input to GPIO Port A
    mcp23s17_write_reg(leds, GPIOA, hw_addr, mcp23s17_fd);

    close(mcp23s17_fd);
}

