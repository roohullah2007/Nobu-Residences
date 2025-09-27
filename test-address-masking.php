<?php

use App\Http\Controllers\AgentController;

// Quick test to verify address masking
class AddressMaskingTest {
    
    public function testMaskAddress() {
        $controller = new AgentController();
        
        // Use reflection to access private method
        $reflection = new ReflectionClass($controller);
        $method = $reflection->getMethod('maskAddress');
        $method->setAccessible(true);
        
        $testAddresses = [
            '33 Rue Nationale, 13000 Marseille',
            '408 - 155 Dalhousie Street, Toronto, ON',
            '123 Main Street, New York, NY'
        ];
        
        echo "Testing Address Masking:\n\n";
        
        foreach ($testAddresses as $address) {
            $masked = $method->invokeArgs($controller, [$address]);
            echo "Original: {$address}\n";
            echo "Masked:   {$masked}\n\n";
        }
    }
}

// Run the test
$test = new AddressMaskingTest();
$test->testMaskAddress();
